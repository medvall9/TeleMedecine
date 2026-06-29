"use client"

import Link from "next/link"
import { Users, CalendarCheck, ClipboardCheck, AlertTriangle, ArrowRight } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusBadge, TypeBadge } from "@/components/shared/status-badge"
import { StatCardSkeleton, TableSkeleton } from "@/components/shared/table-skeleton"
import { useAuthContext } from "@/queries/useAuth"
import { useDashboard } from "@/queries/useDashboard"
import { useAppointments } from "@/queries/useAppointments"
import { usePatients } from "@/queries/usePatients"
import { getInitials, formatDateTime, formatTime } from "@/utils/formatDate"

export function DashboardView() {
  const { user } = useAuthContext()
  const { stats, isLoading: statsLoading, role } = useDashboard()
  const { appointments, isLoading: aptLoading } = useAppointments()
  const { patients, isLoading: patientsLoading } = usePatients(role !== "patient")

  const displayName = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.username
    : ""

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayAppointments = appointments
    .filter((a) => a.date === todayStr)
    .slice(0, 5)

  const kpiCards =
    role === "admin"
      ? [
          { title: "Patients", value: stats.patients ?? 0, icon: Users, accent: "var(--chart-1)" },
          { title: "Rendez-vous", value: stats.rendezvous ?? 0, icon: CalendarCheck, accent: "var(--chart-3)" },
          { title: "Consultations", value: stats.consultations ?? 0, icon: ClipboardCheck, accent: "var(--chart-2)" },
          { title: "Notifications", value: stats.notifications ?? 0, icon: AlertTriangle, accent: "var(--destructive)" },
        ]
      : role === "medecin"
        ? [
            { title: "Mes rendez-vous", value: stats.mes_rendezvous ?? 0, icon: CalendarCheck, accent: "var(--chart-3)" },
            { title: "Mes consultations", value: stats.mes_consultations ?? 0, icon: ClipboardCheck, accent: "var(--chart-2)" },
            { title: "Mes patients", value: stats.mes_patients ?? 0, icon: Users, accent: "var(--chart-1)" },
            { title: "Notifications", value: stats.notifications ?? 0, icon: AlertTriangle, accent: "var(--destructive)" },
          ]
        : [
            { title: "Mes rendez-vous", value: stats.mes_rendezvous ?? 0, icon: CalendarCheck, accent: "var(--chart-3)" },
            { title: "Mes consultations", value: stats.mes_consultations ?? 0, icon: ClipboardCheck, accent: "var(--chart-2)" },
            { title: "Ordonnances", value: stats.mes_ordonnances ?? 0, icon: ClipboardCheck, accent: "var(--chart-1)" },
            { title: "Notifications", value: stats.notifications ?? 0, icon: AlertTriangle, accent: "var(--destructive)" },
          ]

  const alertPatients = patients.filter((p) => p.allergies).slice(0, 4)

  return (
    <>
      <PageHeader
        title={`Bonjour, ${displayName}`}
        description={`Voici un aperçu de votre activité — ${formatDateTime(new Date())}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : kpiCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={String(card.value)}
                icon={card.icon}
                accent={card.accent}
              />
            ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AnalyticsPanel appointments={appointments} />
        </div>

        {role !== "patient" && (
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Alertes médicales</h2>
              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                {alertPatients.length} avec allergies
              </span>
            </div>
            {patientsLoading ? (
              <div className="mt-4"><TableSkeleton rows={3} /></div>
            ) : (
              <div className="mt-4 space-y-3">
                {alertPatients.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <Avatar className="size-9">
                      <AvatarFallback className={p.avatarColor}>
                        {getInitials(p.name ?? "P")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.allergies}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/patients"
              className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Voir tous les patients
              <ArrowRight className="size-4" />
            </Link>
          </Card>
        )}
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">Rendez-vous du jour</h2>
          <Link href="/appointments" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Tout voir <ArrowRight className="size-4" />
          </Link>
        </div>
        {aptLoading ? (
          <div className="p-5"><TableSkeleton rows={3} /></div>
        ) : todayAppointments.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Aucun rendez-vous aujourd&apos;hui.</p>
        ) : (
          <div className="divide-y divide-border">
            {todayAppointments.map((apt) => (
              <div key={apt.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getInitials(apt.patientName ?? "P")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{apt.patientName}</p>
                  <p className="truncate text-xs text-muted-foreground">{apt.motif}</p>
                </div>
                <span className="hidden text-sm text-muted-foreground sm:block">
                  {formatTime(apt.heure)}
                </span>
                {apt.type && <TypeBadge type={apt.type} />}
                <StatusBadge status={apt.statut} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </>
  )
}
