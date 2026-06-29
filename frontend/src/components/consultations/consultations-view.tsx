"use client"

import { useMemo, useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { ConsultationFormModal } from "@/components/forms/consultation-form-modal"
import { useConsultations } from "@/queries/useConsultations"
import { useAppointments } from "@/queries/useAppointments"
import { formatDate } from "@/utils/formatDate"
import type { Consultation } from "@/types/patient.types"
import { Stethoscope } from "lucide-react"

export function ConsultationsView() {
  const { consultations, isLoading, deleteConsultation, refetch } = useConsultations()
  const { appointments } = useAppointments()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Consultation | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const appointmentMap = useMemo(
    () => new Map(appointments.map((a) => [a.id, a])),
    [appointments],
  )

  const rows = useMemo(
    () =>
      [...consultations]
        .map((c) => {
          const apt = appointmentMap.get(c.rendezvous)
          return {
            ...c,
            patientName: apt?.patientName ?? `Patient #${apt?.patient ?? "?"}`,
            doctorName: apt?.doctorName ?? `Médecin #${apt?.medecin ?? "?"}`,
            appointmentDate: apt?.date,
            motif: apt?.motif,
          }
        })
        .sort((a, b) => b.date_consultation.localeCompare(a.date_consultation)),
    [consultations, appointmentMap],
  )

  return (
    <>
      <PageHeader
        title="Consultations"
        description="Consultations liées aux rendez-vous et aux médecins."
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
            <Plus className="size-4" /> Nouvelle consultation
          </Button>
        }
      />

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : rows.length === 0 ? (
          <EmptyState icon={Stethoscope} title="Aucune consultation" description="Créez une consultation à partir d'un rendez-vous existant." />
        ) : (
          rows.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(c.date_consultation)}
                    {c.appointmentDate ? ` · RDV ${formatDate(c.appointmentDate)}` : ""}
                  </p>
                  <p className="mt-1 font-semibold">{c.diagnostic}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.traitement}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{c.patientName}</span>
                    <span className="rounded-full bg-chart-2/10 px-2 py-0.5 text-chart-2">{c.doctorName}</span>
                    {c.motif && <span className="rounded-full bg-secondary px-2 py-0.5">{c.motif}</span>}
                  </div>
                  {c.observations && <p className="mt-2 text-sm">{c.observations}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => { setEditing(c); setFormOpen(true) }}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(c.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConsultationFormModal
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditing(null) }}
        consultation={editing}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer la consultation"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) await deleteConsultation(deleteId)
          refetch()
        }}
      />
    </>
  )
}
