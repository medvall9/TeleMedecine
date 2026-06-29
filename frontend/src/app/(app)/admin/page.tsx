"use client"

import { AdminView } from "@/components/admin/admin-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function AdminPage() {
  const { canViewAdminPanel } = usePermissions()

  return (
    <RoleGuard allowed={canViewAdminPanel}>
      <AdminView />
    </RoleGuard>
  )
}
