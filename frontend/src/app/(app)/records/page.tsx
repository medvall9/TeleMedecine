"use client"

import { RecordsView } from "@/components/records/records-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function RecordsPage() {
  const { canViewMedicalRecords } = usePermissions()

  return (
    <RoleGuard allowed={canViewMedicalRecords}>
      <RecordsView />
    </RoleGuard>
  )
}
