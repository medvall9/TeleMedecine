"use client"

import { StatisticsView } from "@/components/statistics/statistics-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function StatisticsPage() {
  const { canViewStatistics } = usePermissions()

  return (
    <RoleGuard allowed={canViewStatistics}>
      <StatisticsView />
    </RoleGuard>
  )
}
