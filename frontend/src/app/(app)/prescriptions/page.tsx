"use client"

import { PrescriptionsView } from "@/components/prescriptions/prescriptions-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function PrescriptionsPage() {
  const { canManagePrescriptions } = usePermissions()

  return (
    <RoleGuard allowed={canManagePrescriptions}>
      <PrescriptionsView />
    </RoleGuard>
  )
}
