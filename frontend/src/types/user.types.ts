export type UserRole = "admin" | "medecin" | "patient"

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  phone?: string
  address?: string
  image?: string | null
  birth_date?: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  /** Linked Medecin profile id (role medecin only) */
  medecin_id?: number | null
  /** Linked Patient dossier id (role patient only) */
  patient_id?: number | null
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role?: UserRole
  phone?: string
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
}

export interface SystemUser {
  id: number
  name: string
  email: string
  role: UserRole
  status: "active" | "suspended"
  lastActive: string
}

export interface AuditLog {
  id: string
  user: string
  action: string
  target: string
  date: string
  level: "info" | "warning" | "critical"
}
