import { apiClient, unwrap } from "./apiClient"
import type { EnrichedMedecin, Medecin, Specialite } from "@/types/patient.types"
import type { User } from "@/types/user.types"
import { userService } from "./userService"

async function enrichMedecins(rows: Medecin[], specialites: Specialite[]): Promise<EnrichedMedecin[]> {
  let users: User[] = []
  try {
    users = await userService.getAll()
  } catch {
    users = []
  }
  const userMap = new Map(users.map((u) => [u.id, u]))
  const specMap = new Map(specialites.map((s) => [s.id, s.nom]))

  return rows.map((m) => {
    const user = userMap.get(m.user)
    const name = user ? `Dr. ${user.first_name} ${user.last_name}`.trim() : `Médecin #${m.id}`
    return {
      ...m,
      name,
      specialtyName: specMap.get(m.specialite) ?? "—",
    }
  })
}

export const medecinService = {
  async getAll(): Promise<EnrichedMedecin[]> {
    const [rows, specialites] = await Promise.all([
      unwrap(apiClient.get<Medecin[]>("/medecins/")),
      medecinService.getSpecialites(),
    ])
    return enrichMedecins(rows, specialites)
  },

  async getById(id: number): Promise<EnrichedMedecin> {
    const row = await unwrap(apiClient.get<Medecin>(`/medecins/${id}/`))
    const specialites = await medecinService.getSpecialites()
    const [enriched] = await enrichMedecins([row], specialites)
    return enriched
  },

  create: (payload: Partial<Medecin>) => unwrap(apiClient.post<Medecin>("/medecins/", payload)),
  update: (id: number, payload: Partial<Medecin>) =>
    unwrap(apiClient.patch<Medecin>(`/medecins/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/medecins/${id}/`)),

  getSpecialites: () => unwrap(apiClient.get<Specialite[]>("/medecins/specialites/")),
  createSpecialite: (payload: Partial<Specialite>) =>
    unwrap(apiClient.post<Specialite>("/medecins/specialites/", payload)),
  updateSpecialite: (id: number, payload: Partial<Specialite>) =>
    unwrap(apiClient.patch<Specialite>(`/medecins/specialites/${id}/`, payload)),
  removeSpecialite: (id: number) => unwrap(apiClient.delete(`/medecins/specialites/${id}/`)),
}
