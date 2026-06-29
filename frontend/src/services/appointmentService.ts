import { apiClient, unwrap } from "./apiClient"
import type {
  CreateRendezVousPayload,
  EnrichedAppointment,
  RendezVous,
  UpdateRendezVousPayload,
} from "@/types/appointment.types"
import type { EnrichedMedecin, EnrichedPatient } from "@/types/patient.types"
import { inferAppointmentType } from "@/utils/formatDate"
import { medecinService } from "./medecinService"
import { patientService } from "./patientService"

async function enrichAppointments(rows: RendezVous[]): Promise<EnrichedAppointment[]> {
  let patients: EnrichedPatient[] = []
  let medecins: EnrichedMedecin[] = []

  try {
    ;[patients, medecins] = await Promise.all([
      patientService.getAll().catch(() => []),
      medecinService.getAll().catch(() => []),
    ])
  } catch {
    // scoped access may fail for some roles
  }

  const patientMap = new Map(patients.map((p) => [p.id, p]))
  const medecinMap = new Map(medecins.map((m) => [m.id, m]))

  return rows.map((row) => ({
    ...row,
    patientName: patientMap.get(row.patient)?.name ?? `Patient #${row.patient}`,
    doctorName: medecinMap.get(row.medecin)?.name ?? `Médecin #${row.medecin}`,
    type: inferAppointmentType(row.motif),
  }))
}

export const appointmentService = {
  async getAll(): Promise<EnrichedAppointment[]> {
    const rows = await unwrap(apiClient.get<RendezVous[]>("/rendezvous/"))
    return enrichAppointments(rows)
  },

  async getById(id: number): Promise<EnrichedAppointment> {
    const row = await unwrap(apiClient.get<RendezVous>(`/rendezvous/${id}/`))
    const [enriched] = await enrichAppointments([row])
    return enriched
  },

  async create(payload: CreateRendezVousPayload): Promise<EnrichedAppointment> {
    const row = await unwrap(apiClient.post<RendezVous>("/rendezvous/", payload))
    const [enriched] = await enrichAppointments([row])
    return enriched
  },

  async update(id: number, payload: UpdateRendezVousPayload): Promise<EnrichedAppointment> {
    const row = await unwrap(apiClient.patch<RendezVous>(`/rendezvous/${id}/`, payload))
    const [enriched] = await enrichAppointments([row])
    return enriched
  },

  async cancel(id: number): Promise<EnrichedAppointment> {
    return appointmentService.update(id, { statut: "annule" })
  },

  remove: (id: number) => unwrap(apiClient.delete(`/rendezvous/${id}/`)),
}
