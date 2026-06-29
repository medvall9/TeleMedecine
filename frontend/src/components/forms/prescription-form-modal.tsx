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
import { usePrescriptions } from "@/queries/usePrescriptions"
import { useConsultations } from "@/queries/useConsultations"
import { useAppointments } from "@/queries/useAppointments"
import { useConsultationSelectOptions } from "@/utils/selectOptions"
import { getErrorMessage } from "@/services/apiClient"
import { toast } from "sonner"

interface PrescriptionFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultationId?: number
  onSuccess?: () => void
}

export function PrescriptionFormModal({
  open,
  onOpenChange,
  consultationId,
  onSuccess,
}: PrescriptionFormModalProps) {
  const { createOrdonnance, createMedicament } = usePrescriptions()
  const { consultations } = useConsultations()
  const { appointments } = useAppointments()
  const consultationOptions = useConsultationSelectOptions(consultations, appointments)
  const [loading, setLoading] = useState(false)
  const [consultation, setConsultation] = useState(String(consultationId ?? ""))
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [remarque, setRemarque] = useState("")
  const [medNom, setMedNom] = useState("")
  const [medDosage, setMedDosage] = useState("")
  const [medFrequence, setMedFrequence] = useState("")
  const [medDuree, setMedDuree] = useState("")

  useEffect(() => {
    if (open && consultationId) setConsultation(String(consultationId))
  }, [open, consultationId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consultation) {
      toast.error("Sélectionnez une consultation")
      return
    }
    setLoading(true)
    try {
      const ordonnance = await createOrdonnance({
        consultation: Number(consultation),
        date,
        remarque,
      })
      if (medNom.trim()) {
        await createMedicament({
          ordonnance: ordonnance.id,
          nom: medNom,
          dosage: medDosage,
          frequence: medFrequence || "1x/jour",
          duree: medDuree || "7 jours",
          instructions: "",
        })
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
          <DialogTitle>Nouvelle ordonnance</DialogTitle>
          <DialogDescription>Créer une ordonnance liée à une consultation.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Consultation</Label>
            <LabeledSelect
              value={consultation}
              onValueChange={setConsultation}
              options={consultationOptions}
              placeholder="Sélectionner une consultation"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Remarque</Label>
            <Input value={remarque} onChange={(e) => setRemarque(e.target.value)} />
          </div>
          <div className="rounded-lg border border-border p-3 space-y-3">
            <p className="text-sm font-medium">Premier médicament (optionnel)</p>
            <Input placeholder="Nom" value={medNom} onChange={(e) => setMedNom(e.target.value)} />
            <Input placeholder="Dosage" value={medDosage} onChange={(e) => setMedDosage(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Fréquence" value={medFrequence} onChange={(e) => setMedFrequence(e.target.value)} />
              <Input placeholder="Durée" value={medDuree} onChange={(e) => setMedDuree(e.target.value)} />
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
