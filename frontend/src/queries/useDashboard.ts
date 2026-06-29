"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboardService"
import { useAuthContext } from "@/queries/useAuth"
import type { UserRole } from "@/types/user.types"

export const dashboardKeys = {
  byRole: (role: UserRole) => ["dashboard", role] as const,
}

export function useDashboard() {
  const { user } = useAuthContext()
  const role = (user?.role ?? "patient") as UserRole

  const query = useQuery({
    queryKey: dashboardKeys.byRole(role),
    queryFn: () => dashboardService.getByRole(role),
    enabled: !!user,
  })

  return {
    stats: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    role,
  }
}
