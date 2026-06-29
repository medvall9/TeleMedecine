"use client"

import { useState } from "react"
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
import { useConstantes } from "@/queries/useConstantes"
import { useConsultations } from "@/queries/useConsultations"
import { useAppointments } from "@/queries/useAppointments"
import { useConsultationSelectOptions } from "@/utils/selectOptions"
import { getErrorMessage } from "@/services/apiClient"
import { toast } from "sonner"

interface ConstanteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function ConstanteFormModal({ open, onOpenChange, onSuccess }: ConstanteFormModalProps) {
  const { createConstante } = useConstantes()
  const { consultations } = useConsultations()
  const { appointments } = useAppointments()
  const consultationOptions = useConsultationSelectOptions(consultations, appointments)
  const [loading, setLoading] = useState(false)
  const [consultationId, setConsultationId] = useState("")
  const [temperature, setTemperature] = useState("")
  const [tension, setTension] = useState("")
  const [rythme, setRythme] = useState("")
  const [spo2, setSpo2] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consultationId) {
      toast.error("Sélectionnez une consultation")
      return
    }
    setLoading(true)
    try {
      await createConstante({
        consultation: Number(consultationId),
        temperature: temperature ? Number(temperature) : null,
        tension_arterielle: tension || undefined,
        rythme_cardiaque: rythme ? Number(rythme) : null,
        saturation_oxygene: spo2 ? Number(spo2) : null,
      })
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
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Constantes vitales</DialogTitle>
          <DialogDescription>Enregistrer les constantes pour une consultation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Consultation</Label>
            <LabeledSelect
              value={consultationId}
              onValueChange={setConsultationId}
              options={consultationOptions}
              placeholder="Sélectionner une consultation"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Température (°C)</Label>
              <Input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tension</Label>
              <Input placeholder="120/80" value={tension} onChange={(e) => setTension(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>FC (bpm)</Label>
              <Input type="number" value={rythme} onChange={(e) => setRythme(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>SpO2 (%)</Label>
              <Input type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} />
            </div>
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
