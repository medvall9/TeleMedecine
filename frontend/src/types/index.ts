export * from "./user.types"
export * from "./appointment.types"
export * from "./patient.types"

// Legacy aliases for gradual migration
export type { EnrichedAppointment as Appointment } from "./appointment.types"
export type { EnrichedPatient as Patient } from "./patient.types"
export type { EnrichedMedecin as Doctor } from "./patient.types"
