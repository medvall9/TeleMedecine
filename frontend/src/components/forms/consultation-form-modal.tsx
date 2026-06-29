"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LabeledSelect } from "@/components/shared/labeled-select"
import { useConsultations } from "@/queries/useConsultations"
import { useAppointments } from "@/queries/useAppointments"
import { useAppointmentSelectOptions } from "@/utils/selectOptions"
import { getErrorMessage } from "@/services/apiClient"
import { toast } from "sonner"
import type { Consultation } from "@/types/patient.types"

interface ConsultationFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId?: number
  consultation?: Consultation | null
  onSuccess?: () => void
}

export function ConsultationFormModal({
  open,
  onOpenChange,
  patientId,
  consultation,
  onSuccess,
}: ConsultationFormModalProps) {
  const { createConsultation, updateConsultation } = useConsultations()
  const { appointments } = useAppointments()
  const [loading, setLoading] = useState(false)
  const [rendezvousId, setRendezvousId] = useState("")
  const [diagnostic, setDiagnostic] = useState("")
  const [traitement, setTraitement] = useState("")
  const [observations, setObservations] = useState("")
  const [dateConsultation, setDateConsultation] = useState(new Date().toISOString().slice(0, 10))

  const patientAppointments = patientId
    ? appointments.filter((a) => a.patient === patientId)
    : appointments
  const appointmentOptions = useAppointmentSelectOptions(patientAppointments)

  useEffect(() => {
    if (!open) return
    if (consultation) {
      setRendezvousId(String(consultation.rendezvous))
      setDiagnostic(consultation.diagnostic)
      setTraitement(consultation.traitement)
      setObservations(consultation.observations ?? "")
      setDateConsultation(consultation.date_consultation)
    } else {
      setRendezvousId("")
      setDiagnostic("")
      setTraitement("")
      setObservations("")
      setDateConsultation(new Date().toISOString().slice(0, 10))
    }
  }, [open, consultation])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rendezvousId) {
      toast.error("Sélectionnez un rendez-vous")
      return
    }
    setLoading(true)
    try {
      const payload = {
        rendezvous: Number(rendezvousId),
        diagnostic,
        traitement,
        observations,
        date_consultation: dateConsultation,
      }
      if (consultation) {
        await updateConsultation({ id: consultation.id, payload })
      } else {
        await createConsultation(payload)
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{consultation ? "Modifier la consultation" : "Nouvelle consultation"}</DialogTitle>
          <DialogDescription>Consultation liée à un rendez-vous (patient + médecin).</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rendez-vous</Label>
            <LabeledSelect
              value={rendezvousId}
              onValueChange={setRendezvousId}
              options={appointmentOptions}
              placeholder="Sélectionner un rendez-vous"
              disabled={!!consultation}
            />
          </div>
          <div className="space-y-2">
            <Label>Date consultation</Label>
            <Input type="date" value={dateConsultation} onChange={(e) => setDateConsultation(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Diagnostic</Label>
            <Input value={diagnostic} onChange={(e) => setDiagnostic(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Traitement</Label>
            <Input value={traitement} onChange={(e) => setTraitement(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Observations</Label>
            <Input value={observations} onChange={(e) => setObservations(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
