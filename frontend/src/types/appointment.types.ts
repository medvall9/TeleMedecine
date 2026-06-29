export type AppointmentStatus = "en_attente" | "confirme" | "annule" | "termine"
export type AppointmentType = "teleconsultation" | "in-person"

export interface RendezVous {
  id: number
  patient: number
  medecin: number
  date: string
  heure: string
  motif: string
  statut: AppointmentStatus
  created_at: string
  updated_at: string
}

export interface EnrichedAppointment extends RendezVous {
  patientName?: string
  doctorName?: string
  type?: AppointmentType
}

export interface CreateRendezVousPayload {
  patient: number
  medecin: number
  date: string
  heure: string
  motif: string
  statut?: AppointmentStatus
}

export interface UpdateRendezVousPayload extends Partial<CreateRendezVousPayload> {}
