import { apiClient, unwrap } from "./apiClient"
import type { Consultation } from "@/types/patient.types"

export const consultationService = {
  getAll: () => unwrap(apiClient.get<Consultation[]>("/consultations/")),
  getById: (id: number) => unwrap(apiClient.get<Consultation>(`/consultations/${id}/`)),
  create: (payload: Partial<Consultation>) =>
    unwrap(apiClient.post<Consultation>("/consultations/", payload)),
  update: (id: number, payload: Partial<Consultation>) =>
    unwrap(apiClient.patch<Consultation>(`/consultations/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/consultations/${id}/`)),
}
