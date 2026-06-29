"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bell,
  Calendar,
  ClipboardList,
  Pill,
  Settings,
  Trash2,
  CheckCheck,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TableSkeleton } from "@/components/shared/table-skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ConfirmDialog } from "@/components/modals/confirm-dialog"
import { useNotifications } from "@/queries/useNotifications"
import { formatDateTime } from "@/utils/formatDate"
import { cn } from "@/lib/utils"
import type { Notification } from "@/types/patient.types"

const typeMeta: Record<
  Notification["type"],
  { label: string; icon: typeof Bell; className: string }
> = {
  rendezvous: { label: "Rendez-vous", icon: Calendar, className: "bg-chart-1/10 text-chart-1" },
  consultation: { label: "Consultation", icon: ClipboardList, className: "bg-chart-2/10 text-chart-2" },
  ordonnance: { label: "Ordonnance", icon: Pill, className: "bg-chart-3/10 text-chart-3" },
  system: { label: "Système", icon: Settings, className: "bg-muted text-muted-foreground" },
}

export function NotificationsView() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications()

  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return filter === "unread" ? sorted.filter((n) => !n.est_lu) : sorted
  }, [notifications, filter])

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Alertes rendez-vous, consultations et ordonnances."
        action={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              <CheckCheck className="size-4" /> Tout marquer lu
            </Button>
          ) : undefined
        }
      />

      <div className="mt-4 flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          Toutes ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
        >
          Non lues ({unreadCount})
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
            description="Les actions sur rendez-vous, consultations et ordonnances apparaîtront ici."
          />
        ) : (
          filtered.map((n) => {
            const meta = typeMeta[n.type] ?? typeMeta.system
            const Icon = meta.icon
            return (
              <Card
                key={n.id}
                className={cn(
                  "flex gap-4 p-4 transition-colors",
                  !n.est_lu && "border-primary/30 bg-primary/5",
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    meta.className,
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{n.titre}</p>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", meta.className)}>
                      {meta.label}
                    </span>
                    {!n.est_lu && (
                      <span className="size-2 rounded-full bg-primary" aria-label="Non lu" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {!n.est_lu && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                      Lu
                    </Button>
                  )}
                  <Button variant="ghost" size="icon-sm" onClick={() => setDeleteId(n.id)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Actualisation automatique toutes les 30 secondes.{" "}
        <Link href="/appointments" className="text-primary hover:underline">
          Voir les rendez-vous
        </Link>
      </p>

      <ConfirmDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer la notification"
        confirmLabel="Supprimer"
        variant="destructive"
        onConfirm={async () => {
          if (deleteId) await deleteNotification(deleteId)
        }}
      />
    </>
  )
}
