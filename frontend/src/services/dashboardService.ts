import { apiClient, unwrap } from "./apiClient"
import type { DashboardStats } from "@/types/patient.types"
import type { UserRole } from "@/types/user.types"

export const dashboardService = {
  getByRole: (role: UserRole) =>
    unwrap(apiClient.get<DashboardStats>(`/dashboard/${role}/`)),
}
