"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { PrescriptionFormModal } from "@/components/forms/prescription-form-modal"
import { usePrescriptions } from "@/queries/usePrescriptions"
import { formatDate } from "@/utils/formatDate"
import { Pill } from "lucide-react"

export function PrescriptionsView() {
  const { ordonnances, isLoading, deleteOrdonnance, refetch } = usePrescriptions()
  const [formOpen, setFormOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  return (
    <>
      <PageHeader
        title="Prescriptions"
        description="Ordonnances et médicaments prescrits."
        action={
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus className="size-4" /> Nouvelle ordonnance
          </Button>
        }
      />
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : ordonnances.length === 0 ? (
          <EmptyState icon={Pill} title="Aucune prescription" />
        ) : (
          ordonnances.map((o) => (
            <Card key={o.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{formatDate(o.date)}</p>
                  <p className="font-semibold">{o.remarque || "Ordonnance"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    #{o.id}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(o.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {o.medicaments?.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border p-3 text-sm">
                    <p className="font-medium">{m.nom}</p>
                    <p className="text-muted-foreground">{m.dosage} · {m.frequence} · {m.duree}</p>
                  </div>
                )) ?? <p className="text-sm text-muted-foreground">Aucun médicament</p>}
              </div>
            </Card>
          ))
        )}
      </div>

      <PrescriptionFormModal open={formOpen} onOpenChange={setFormOpen} onSuccess={() => refetch()} />

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer l'ordonnance"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) await deleteOrdonnance(deleteId)
          refetch()
        }}
      />
    </>
  )
}
