"use client"

import { PageHeader } from "@/components/shared/page-header"
import { PatientsView } from "@/components/patients/patients-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function PatientsPage() {
  const { canViewPatients } = usePermissions()

  return (
    <RoleGuard allowed={canViewPatients}>
      <PageHeader title="Patients" description="Gérez et consultez les dossiers patients." />
      <div className="mt-6">
        <PatientsView />
      </div>
    </RoleGuard>
  )
}
