import { apiClient, unwrap } from "./apiClient"
import type {
  CreatePatientPayload,
  EnrichedPatient,
  PatientRecord,
} from "@/types/patient.types"
import type { User } from "@/types/user.types"
import { calculateAge, getAvatarColor } from "@/utils/formatDate"
import { userService } from "./userService"

async function enrichPatients(records: PatientRecord[]): Promise<EnrichedPatient[]> {
  let users: User[] = []
  try {
    users = await userService.getAll()
  } catch {
    users = []
  }
  const userMap = new Map(users.map((u) => [u.id, u]))

  return records.map((p) => {
    const user = userMap.get(p.user)
    const name = user ? `${user.first_name} ${user.last_name}`.trim() || user.username : `Patient #${p.id}`
    return {
      ...p,
      name,
      email: user?.email,
      phone: user?.phone,
      age: calculateAge(p.date_naissance),
      avatarColor: getAvatarColor(name),
      tags: [],
    }
  })
}

export const patientService = {
  async getAll(): Promise<EnrichedPatient[]> {
    const records = await unwrap(apiClient.get<PatientRecord[]>("/patients/"))
    return enrichPatients(records)
  },

  async getById(id: number): Promise<EnrichedPatient> {
    const record = await unwrap(apiClient.get<PatientRecord>(`/patients/${id}/`))
    const [enriched] = await enrichPatients([record])
    return enriched
  },

  create: (payload: CreatePatientPayload) =>
    unwrap(apiClient.post<PatientRecord>("/patients/", payload)),

  update: (id: number, payload: Partial<CreatePatientPayload>) =>
    unwrap(apiClient.patch<PatientRecord>(`/patients/${id}/`, payload)),

  remove: (id: number) => unwrap(apiClient.delete(`/patients/${id}/`)),
}
