import { cn } from "@/lib/utils"
import type { AppointmentStatus, AppointmentType, PatientTag } from "@/types"
import { Video, MapPin } from "lucide-react"

const statusConfig: Record<AppointmentStatus, { label: string; className: string }> = {
  confirme: { label: "Confirmé", className: "bg-success/10 text-success border-success/20" },
  en_attente: { label: "En attente", className: "bg-warning/15 text-warning-foreground border-warning/30" },
  annule: { label: "Annulé", className: "bg-destructive/10 text-destructive border-destructive/20" },
  termine: { label: "Terminé", className: "bg-muted text-muted-foreground border-border" },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const cfg = statusConfig[status] ?? statusConfig.en_attente
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {cfg.label}
    </span>
  )
}

export function TypeBadge({ type }: { type: AppointmentType }) {
  const isTele = type === "teleconsultation"
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {isTele ? <Video className="size-3" /> : <MapPin className="size-3" />}
      {isTele ? "Téléconsultation" : "Présentiel"}
    </span>
  )
}

const tagConfig: Record<PatientTag, { label: string; className: string }> = {
  chronic: { label: "Chronique", className: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  urgent: { label: "Urgent", className: "bg-destructive/10 text-destructive border-destructive/20" },
  "follow-up": { label: "Suivi régulier", className: "bg-chart-3/10 text-chart-3 border-chart-3/20" },
  stable: { label: "Stable", className: "bg-success/10 text-success border-success/20" },
}

export function PatientTagBadge({ tag }: { tag: PatientTag }) {
  const cfg = tagConfig[tag]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  )
}
