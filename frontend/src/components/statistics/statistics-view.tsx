"use client"

import { PageHeader } from "@/components/shared/page-header"
import { StatCard } from "@/components/shared/stat-card"
import { AnalyticsPanel } from "@/components/dashboard/analytics-panel"
import { Card } from "@/components/ui/card"
import { StatCardSkeleton } from "@/components/shared/table-skeleton"
import { useDashboard } from "@/queries/useDashboard"
import { useAppointments } from "@/queries/useAppointments"
import { useQuery } from "@tanstack/react-query"
import { rapportService } from "@/services/rapportService"
import { medecinService } from "@/services/medecinService"
import { usePermissions } from "@/hooks/usePermissions"
import { BarChart3, Users, CalendarCheck, ClipboardCheck } from "lucide-react"

export function StatisticsView() {
  const { stats, isLoading, role } = useDashboard()
  const { appointments } = useAppointments()
  const { canViewStatistics } = usePermissions()

  const rapportsQuery = useQuery({
    queryKey: ["rapports"],
    queryFn: () => rapportService.getAll(),
    enabled: role === "admin",
  })

  const specialitesQuery = useQuery({
    queryKey: ["specialites"],
    queryFn: () => medecinService.getSpecialites(),
    enabled: role === "admin",
  })

  if (!canViewStatistics) {
    return <p className="text-muted-foreground">Accès non autorisé.</p>
  }

  return (
    <>
      <PageHeader title="Statistiques" description="Indicateurs de performance et tendances." />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard title="Rendez-vous" value={String(stats.rendezvous ?? stats.mes_rendezvous ?? 0)} icon={CalendarCheck} accent="var(--chart-1)" />
            <StatCard title="Consultations" value={String(stats.consultations ?? stats.mes_consultations ?? 0)} icon={ClipboardCheck} accent="var(--chart-2)" />
            <StatCard title="Patients" value={String(stats.patients ?? stats.mes_patients ?? 0)} icon={Users} accent="var(--chart-3)" />
            <StatCard title="Rapports" value={String(rapportsQuery.data?.length ?? 0)} icon={BarChart3} accent="var(--chart-4)" />
          </>
        )}
      </div>

      <div className="mt-6">
        <AnalyticsPanel appointments={appointments} />
      </div>

      {role === "admin" && specialitesQuery.data && (
        <Card className="mt-6 p-5">
          <h2 className="font-semibold">Spécialités</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {specialitesQuery.data.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{s.nom}</p>
                <p className="text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  )
}
