"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useAppointments } from "@/queries/useAppointments"
import { usePatients } from "@/queries/usePatients"
import { useQuery } from "@tanstack/react-query"
import { medecinService } from "@/services/medecinService"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthContext } from "@/queries/useAuth"
import { useActorIds } from "@/hooks/useActorIds"
import { getErrorMessage } from "@/services/apiClient"
import { toast } from "sonner"
import type { EnrichedAppointment, AppointmentStatus } from "@/types/appointment.types"

interface AppointmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: EnrichedAppointment | null
  onSuccess?: () => void
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentFormModalProps) {
  const { createAppointment, updateAppointment, appointments } = useAppointments()
  const { patients } = usePatients()
  const { role, canManagePrescriptions } = usePermissions()
  const { user, refreshProfile } = useAuthContext()
  const { medecinId: actorMedecinId, patientId: actorPatientId, hasMedecinProfile, hasPatientProfile } =
    useActorIds()

  const { data: medecins = [] } = useQuery({
    queryKey: ["medecins"],
    queryFn: () => medecinService.getAll(),
    enabled: role === "admin",
  })

  const [loading, setLoading] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [medecinId, setMedecinId] = useState("")
  const [statut, setStatut] = useState<AppointmentStatus>("en_attente")
  const [date, setDate] = useState("")
  const [heure, setHeure] = useState("")
  const [motif, setMotif] = useState("")

  const patientAppointments = useMemo(
    () =>
      role === "patient" && actorPatientId
        ? appointments.filter((a) => a.patient === actorPatientId)
        : [],
    [appointments, role, actorPatientId],
  )

  const knownMedecins = useMemo(() => {
    const map = new Map<number, string>()
    patientAppointments.forEach((a) => {
      map.set(a.medecin, a.doctorName ?? `Médecin #${a.medecin}`)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [patientAppointments])

  useEffect(() => {
    if (open && (role === "medecin" || role === "patient")) {
      void refreshProfile()
    }
  }, [open, role, refreshProfile])

  useEffect(() => {
    if (!open) return
    setPatientId(
      String(appointment?.patient ?? (role === "patient" ? actorPatientId ?? "" : "")),
    )
    setMedecinId(
      String(appointment?.medecin ?? (role === "medecin" ? actorMedecinId ?? "" : "")),
    )
    setStatut(appointment?.statut ?? "en_attente")
    setDate(appointment?.date ?? "")
    setHeure(appointment?.heure?.slice(0, 5) ?? "")
    setMotif(appointment?.motif ?? "")
  }, [open, appointment, role, actorMedecinId, actorPatientId])
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const resolvedMedecin =
      role === "admin"
        ? Number(medecinId)
        : role === "medecin"
          ? Number(medecinId || actorMedecinId)
          : Number(medecinId)

    const resolvedPatient =
      role === "patient"
        ? Number(patientId || actorPatientId)
        : Number(patientId)

    if (!resolvedPatient || Number.isNaN(resolvedPatient)) {
      toast.error("Patient requis. Un administrateur doit créer votre dossier patient.")
      return
    }
    if (!resolvedMedecin || Number.isNaN(resolvedMedecin)) {
      toast.error("Médecin requis. Un administrateur doit lier votre profil médecin.")
      return
    }

    setLoading(true)
    try {
      const payload = {
        patient: resolvedPatient,
        medecin: resolvedMedecin,
        date,
        heure: heure.length === 5 ? `${heure}:00` : heure,
        motif,
        statut,
      }
      if (appointment) {
        await updateAppointment({ id: appointment.id, payload })
      } else {
        await createAppointment(payload)
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const showPatientSelect = role !== "patient"
  const showMedecinSelect = role === "admin"

  const patientOptions = useMemo(
    () => patients.map((p) => ({ value: String(p.id), label: p.name ?? `Patient #${p.id}` })),
    [patients],
  )
  const medecinOptions = useMemo(
    () => medecins.map((m) => ({ value: String(m.id), label: m.name ?? `Médecin #${m.id}` })),
    [medecins],
  )
  const statusOptions = useMemo(
    () => [
      { value: "en_attente", label: "En attente" },
      { value: "confirme", label: "Confirmé" },
      { value: "annule", label: "Annulé" },
      { value: "termine", label: "Terminé" },
    ],
    [],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{appointment ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</DialogTitle>
          <DialogDescription>Remplissez les informations du rendez-vous.</DialogDescription>
        </DialogHeader>

        {role === "patient" && !hasPatientProfile && !appointment && (
          <p className="text-sm text-destructive">
            Votre dossier patient n&apos;est pas encore créé. Contactez l&apos;administration.
          </p>
        )}
        {role === "medecin" && !hasMedecinProfile && !appointment && (
          <p className="text-sm text-destructive">
            Votre profil médecin n&apos;est pas encore lié. Contactez l&apos;administration.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {showPatientSelect && (
            <div className="space-y-2">
              <Label>Patient</Label>
              <LabeledSelect
                value={patientId}
                onValueChange={setPatientId}
                options={patientOptions}
                placeholder="Sélectionner un patient"
              />
            </div>
          )}

          {role === "patient" && (
            <div className="space-y-2">
              <Label>Patient</Label>
              <Input value={patients.find((p) => p.id === actorPatientId)?.name ?? `Patient #${actorPatientId}`} readOnly />
            </div>
          )}

          {showMedecinSelect && (
            <div className="space-y-2">
              <Label>Médecin</Label>
              {medecins.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun médecin — créez un profil médecin dans Admin.</p>
              ) : (
                <LabeledSelect
                  value={medecinId}
                  onValueChange={setMedecinId}
                  options={medecinOptions}
                  placeholder="Sélectionner un médecin"
                />
              )}
            </div>
          )}

          {role === "medecin" && (
            <div className="space-y-2">
              <Label>Médecin</Label>
              <Input
                value={
                  user
                    ? `Dr. ${user.first_name} ${user.last_name}`.trim() || user.username
                    : "Médecin connecté"
                }
                readOnly
              />
            </div>
          )}

          {role === "patient" && !showMedecinSelect && (
            <div className="space-y-2">
              <Label>Médecin</Label>
              {knownMedecins.length > 0 ? (
                <LabeledSelect
                  value={medecinId}
                  onValueChange={setMedecinId}
                  options={knownMedecins.map((m) => ({ value: String(m.id), label: m.name }))}
                  placeholder="Choisir un médecin"
                />
              ) : (
                <Input
                  type="number"
                  value={medecinId}
                  onChange={(e) => setMedecinId(e.target.value)}
                  placeholder="ID du médecin (fourni par l'accueil)"
                  required
                />
              )}
              <p className="text-xs text-muted-foreground">
                {knownMedecins.length > 0
                  ? "Médecins issus de vos rendez-vous précédents."
                  : "Premier rendez-vous : saisissez l'ID médecin fourni par l'accueil."}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heure">Heure</Label>
              <Input id="heure" type="time" value={heure} onChange={(e) => setHeure(e.target.value)} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="motif">Motif</Label>
            <Input id="motif" value={motif} onChange={(e) => setMotif(e.target.value)} required />
          </div>
          {(canManagePrescriptions || role === "admin") && (
            <div className="space-y-2">
              <Label>Statut</Label>
              <LabeledSelect
                value={statut}
                onValueChange={(v) => setStatut((v || "en_attente") as AppointmentStatus)}
                options={statusOptions}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={loading}>{loading ? "Enregistrement..." : "Enregistrer"}</Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </Dialog>
  )
}
