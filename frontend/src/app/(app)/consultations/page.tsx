"use client"

import { ConsultationsView } from "@/components/consultations/consultations-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function ConsultationsPage() {
  const { canViewConsultationsPage } = usePermissions()

  return (
    <RoleGuard allowed={canViewConsultationsPage}>
      <ConsultationsView />
    </RoleGuard>
  )
}
