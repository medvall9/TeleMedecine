import { apiClient, unwrap } from "./apiClient"
import type { Rapport } from "@/types/patient.types"

export const rapportService = {
  getAll: () => unwrap(apiClient.get<Rapport[]>("/rapports/")),
  getById: (id: number) => unwrap(apiClient.get<Rapport>(`/rapports/${id}/`)),
  create: (payload: Partial<Rapport>) => unwrap(apiClient.post<Rapport>("/rapports/", payload)),
  update: (id: number, payload: Partial<Rapport>) =>
    unwrap(apiClient.patch<Rapport>(`/rapports/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/rapports/${id}/`)),
}
