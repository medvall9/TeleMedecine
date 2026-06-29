"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
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
import { usePatients } from "@/queries/usePatients"
import { userService } from "@/services/userService"
import { getErrorMessage } from "@/services/apiClient"
import { toast } from "sonner"
import type { CreatePatientPayload, EnrichedPatient } from "@/types/patient.types"

interface PatientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: EnrichedPatient | null
  onSuccess?: () => void
}

export function PatientFormModal({
  open,
  onOpenChange,
  patient,
  onSuccess,
}: PatientFormModalProps) {
  const { createPatient, updatePatient } = usePatients()
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
    enabled: open && !patient,
  })

  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState("")
  const [dateNaissance, setDateNaissance] = useState("")
  const [sexe, setSexe] = useState<"M" | "F">("M")
  const [groupeSanguin, setGroupeSanguin] = useState("")
  const [allergies, setAllergies] = useState("")
  const [antecedents, setAntecedents] = useState("")

  const patientUsers = users.filter((u) => u.role === "patient")
  const userOptions = useMemo(
    () =>
      patientUsers.map((u) => ({
        value: String(u.id),
        label: `${u.first_name} ${u.last_name} (${u.username})`.trim(),
      })),
    [patientUsers],
  )

  useEffect(() => {
    if (!open) return
    if (patient) {
      setUserId(String(patient.user))
      setDateNaissance(patient.date_naissance)
      setSexe(patient.sexe)
      setGroupeSanguin(patient.groupe_sanguin ?? "")
      setAllergies(patient.allergies ?? "")
      setAntecedents(patient.antecedents ?? "")
    } else {
      setUserId("")
      setDateNaissance("")
      setSexe("M")
      setGroupeSanguin("")
      setAllergies("")
      setAntecedents("")
    }
  }, [open, patient])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: CreatePatientPayload = {
        user: Number(userId),
        date_naissance: dateNaissance,
        sexe,
        groupe_sanguin: groupeSanguin || undefined,
        allergies,
        antecedents,
      }
      if (patient) {
        await updatePatient({
          id: patient.id,
          payload: {
            date_naissance: dateNaissance,
            sexe,
            groupe_sanguin: groupeSanguin || undefined,
            allergies,
            antecedents,
          },
        })
      } else {
        await createPatient(payload)
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
          <DialogTitle>{patient ? "Modifier le patient" : "Nouveau patient"}</DialogTitle>
          <DialogDescription>
            Liez un compte utilisateur au dossier médical.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!patient && (
            <div className="space-y-2">
              <Label>Compte utilisateur</Label>
              <LabeledSelect
                value={userId}
                onValueChange={setUserId}
                options={userOptions}
                placeholder="Sélectionner un utilisateur patient"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date de naissance</Label>
              <Input type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Sexe</Label>
              <LabeledSelect
                value={sexe}
                onValueChange={(v) => setSexe((v || "M") as "M" | "F")}
                options={[
                  { value: "M", label: "Masculin" },
                  { value: "F", label: "Féminin" },
                ]}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Groupe sanguin</Label>
            <Input value={groupeSanguin} onChange={(e) => setGroupeSanguin(e.target.value)} placeholder="O+" />
          </div>
          <div className="space-y-2">
            <Label>Allergies</Label>
            <Input value={allergies} onChange={(e) => setAllergies(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Antécédents</Label>
            <Input value={antecedents} onChange={(e) => setAntecedents(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading || (!patient && !userId)}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
