"use client"

import { use } from "react"
import { PatientProfileView } from "@/components/patients/patient-profile-view"
import { RoleGuard } from "@/components/auth/role-guard"
import { usePermissions } from "@/hooks/usePermissions"

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { canViewPatients } = usePermissions()
  const { id } = use(params)

  return (
    <RoleGuard allowed={canViewPatients}>
      <PatientProfileView patientId={Number(id)} />
    </RoleGuard>
  )
}
