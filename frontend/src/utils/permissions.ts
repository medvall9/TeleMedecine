import type { UserRole } from "@/types/user.types"

export function canViewPatients(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canManageUsers(role?: UserRole): boolean {
  return role === "admin"
}

export function canManageMedecins(role?: UserRole): boolean {
  return role === "admin"
}

export function canViewConsultations(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canManagePrescriptions(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canDeleteAppointment(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canEditAppointment(role?: UserRole): boolean {
  return role === "admin" || role === "medecin" || role === "patient"
}

export function canViewAdminPanel(role?: UserRole): boolean {
  return role === "admin"
}

export function canViewStatistics(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canViewMedicalRecords(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function canViewQuestionnaires(role?: UserRole): boolean {
  return role === "patient"
}

export function canViewConsultationsPage(role?: UserRole): boolean {
  return role === "admin" || role === "medecin"
}

export function getDefaultRoute(role?: UserRole): string {
  return "/"
}

export const navPermissions: Record<string, (role?: UserRole) => boolean> = {
  "/": () => true,
  "/appointments": () => true,
  "/notifications": () => true,
  "/records": canViewMedicalRecords,
  "/consultations": canViewConsultationsPage,
  "/prescriptions": canManagePrescriptions,
  "/patients": canViewPatients,
  "/questionnaires": canViewQuestionnaires,
  "/statistics": canViewStatistics,
  "/admin": canViewAdminPanel,
  "/settings": () => true,
}
