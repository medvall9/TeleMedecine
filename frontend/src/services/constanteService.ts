import { apiClient, unwrap } from "./apiClient"
import type { Constante } from "@/types/patient.types"

export const constanteService = {
  getAll: () => unwrap(apiClient.get<Constante[]>("/constantes/")),
  getById: (id: number) => unwrap(apiClient.get<Constante>(`/constantes/${id}/`)),
  create: (payload: Partial<Constante>) =>
    unwrap(apiClient.post<Constante>("/constantes/", payload)),
  update: (id: number, payload: Partial<Constante>) =>
    unwrap(apiClient.patch<Constante>(`/constantes/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/constantes/${id}/`)),
}
