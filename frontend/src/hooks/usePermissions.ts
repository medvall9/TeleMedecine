"use client"

import { useAuthContext } from "@/queries/useAuth"
import type { UserRole } from "@/types/user.types"
import * as permissions from "@/utils/permissions"

export function usePermissions() {
  const { user } = useAuthContext()
  const role = user?.role as UserRole | undefined

  return {
    role,
    user,
    canViewPatients: permissions.canViewPatients(role),
    canManageUsers: permissions.canManageUsers(role),
    canManageMedecins: permissions.canManageMedecins(role),
    canViewConsultations: permissions.canViewConsultations(role),
    canManagePrescriptions: permissions.canManagePrescriptions(role),
    canDeleteAppointment: permissions.canDeleteAppointment(role),
    canEditAppointment: permissions.canEditAppointment(role),
    canViewAdminPanel: permissions.canViewAdminPanel(role),
    canViewStatistics: permissions.canViewStatistics(role),
    canViewMedicalRecords: permissions.canViewMedicalRecords(role),
    canViewConsultationsPage: permissions.canViewConsultationsPage(role),
    canViewQuestionnaires: permissions.canViewQuestionnaires(role),
    canAccessNav: (href: string) => permissions.navPermissions[href]?.(role) ?? true,
  }
}
