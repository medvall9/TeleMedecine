"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EmptyState } from "@/components/shared/empty-state"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { ConsultationFormModal } from "@/components/forms/consultation-form-modal"
import { PrescriptionFormModal } from "@/components/forms/prescription-form-modal"
import { ConstanteFormModal } from "@/components/forms/constante-form-modal"
import { usePatients } from "@/queries/usePatients"
import { usePatientMedicalRecords } from "@/queries/useMedicalRecords"
import { useAppointments } from "@/queries/useAppointments"
import { useConsultations } from "@/queries/useConsultations"
import { usePrescriptions } from "@/queries/usePrescriptions"
import { useConstantes } from "@/queries/useConstantes"
import { formatDate, getInitials } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import type { Consultation } from "@/types/patient.types"

export function RecordsView() {
  const { patients, isLoading: patientsLoading } = usePatients()
  const { appointments } = useAppointments()
  const { deleteConsultation } = useConsultations()
  const { deleteOrdonnance } = usePrescriptions()
  const { deleteConstante } = useConstantes()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const activePatient = patients.find((p) => p.id === selectedId) ?? patients[0]
  const patientId = activePatient?.id ?? 0
  const rendezvousIds = appointments.filter((a) => a.patient === patientId).map((a) => a.id)
  const appointmentMap = useMemo(
    () => new Map(appointments.filter((a) => a.patient === patientId).map((a) => [a.id, a])),
    [appointments, patientId],
  )
  const { data: records, isLoading: recordsLoading, refetch } = usePatientMedicalRecords(patientId, rendezvousIds)

  const [consultOpen, setConsultOpen] = useState(false)
  const [editConsult, setEditConsult] = useState<Consultation | null>(null)
  const [rxOpen, setRxOpen] = useState(false)
  const [constOpen, setConstOpen] = useState(false)
  const [deleteConsult, setDeleteConsult] = useState<number | null>(null)
  const [deleteRx, setDeleteRx] = useState<number | null>(null)
  const [deleteConst, setDeleteConst] = useState<number | null>(null)

  if (patientsLoading) return <TableSkeleton rows={5} />

  return (
    <>
      <PageHeader title="Dossiers médicaux" description="Consultations, prescriptions et constantes vitales." />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="p-3 lg:col-span-1">
          <h3 className="mb-3 px-2 text-sm font-semibold">Patients</h3>
          <div className="max-h-[480px] space-y-1 overflow-y-auto">
            {patients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-secondary",
                  activePatient?.id === p.id && "bg-primary/10",
                )}
              >
                <Avatar className="size-8">
                  <AvatarFallback className={p.avatarColor}>{getInitials(p.name ?? "P")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {!activePatient ? (
            <EmptyState title="Sélectionnez un patient" />
          ) : (
            <Tabs defaultValue="consultations">
              <TabsList>
                <TabsTrigger value="consultations">Consultations</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="constantes">Constantes</TabsTrigger>
              </TabsList>

              <TabsContent value="consultations" className="mt-4">
                <div className="mb-3 flex justify-end">
                  <Button size="sm" onClick={() => { setEditConsult(null); setConsultOpen(true) }}>
                    <Plus className="size-4" /> Ajouter consultation
                  </Button>
                </div>
                {recordsLoading ? (
                  <TableSkeleton rows={3} />
                ) : (
                  <div className="relative space-y-0 border-l-2 border-border pl-6">
                    {(records?.consultations ?? [])
                      .sort((a, b) => b.date_consultation.localeCompare(a.date_consultation))
                      .map((c) => {
                        const apt = appointmentMap.get(c.rendezvous)
                        return (
                        <div key={c.id} className="relative pb-6">
                          <span className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
                          <Card className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-xs text-muted-foreground">{formatDate(c.date_consultation)}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {apt?.doctorName ?? `Médecin #${apt?.medecin ?? "?"}`} · {apt?.motif ?? "—"}
                                </p>
                                <p className="mt-1 font-medium">{c.diagnostic}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{c.traitement}</p>
                                {c.observations && <p className="mt-2 text-sm">{c.observations}</p>}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon-sm" onClick={() => { setEditConsult(c); setConsultOpen(true) }}>
                                  <Pencil className="size-4" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConsult(c.id)}>
                                  <Trash2 className="size-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>
                        )
                      })}
                    {(records?.consultations ?? []).length === 0 && (
                      <p className="text-sm text-muted-foreground">Aucune consultation</p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prescriptions" className="mt-4 space-y-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setRxOpen(true)}>
                    <Plus className="size-4" /> Ajouter ordonnance
                  </Button>
                </div>
                {(records?.ordonnances ?? []).map((o) => (
                  <Card key={o.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                        <p className="font-medium">{o.remarque}</p>
                        {o.medicaments?.map((m) => (
                          <p key={m.id} className="mt-1 text-sm text-muted-foreground">
                            {m.nom} — {m.dosage}, {m.frequence}
                          </p>
                        ))}
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteRx(o.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="constantes" className="mt-4 space-y-3">
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => setConstOpen(true)}>
                    <Plus className="size-4" /> Ajouter constantes
                  </Button>
                </div>
                {(records?.constantes ?? []).map((c) => (
                  <Card key={c.id} className="grid grid-cols-2 gap-3 p-4 text-sm sm:grid-cols-4">
                    <div><p className="text-muted-foreground">Temp.</p><p>{c.temperature ?? "—"}°C</p></div>
                    <div><p className="text-muted-foreground">Tension</p><p>{c.tension_arterielle ?? "—"}</p></div>
                    <div><p className="text-muted-foreground">FC</p><p>{c.rythme_cardiaque ?? "—"} bpm</p></div>
                    <div className="flex items-center justify-between">
                      <div><p className="text-muted-foreground">SpO2</p><p>{c.saturation_oxygene ?? "—"}%</p></div>
                      <Button variant="ghost" size="icon-sm" onClick={() => setDeleteConst(c.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      <ConsultationFormModal
        open={consultOpen}
        onOpenChange={(o) => { setConsultOpen(o); if (!o) setEditConsult(null) }}
        patientId={patientId}
        consultation={editConsult}
        onSuccess={() => refetch()}
      />
      <PrescriptionFormModal open={rxOpen} onOpenChange={setRxOpen} onSuccess={() => refetch()} />
      <ConstanteFormModal open={constOpen} onOpenChange={setConstOpen} onSuccess={() => refetch()} />

      <ConfirmDialog
        open={deleteConsult != null}
        onOpenChange={(o) => !o && setDeleteConsult(null)}
        title="Supprimer la consultation"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => { if (deleteConsult) await deleteConsultation(deleteConsult); refetch() }}
      />
      <ConfirmDialog
        open={deleteRx != null}
        onOpenChange={(o) => !o && setDeleteRx(null)}
        title="Supprimer l'ordonnance"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => { if (deleteRx) await deleteOrdonnance(deleteRx); refetch() }}
      />
      <ConfirmDialog
        open={deleteConst != null}
        onOpenChange={(o) => !o && setDeleteConst(null)}
        title="Supprimer les constantes"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => { if (deleteConst) await deleteConstante(deleteConst); refetch() }}
      />
    </>
  )
}
