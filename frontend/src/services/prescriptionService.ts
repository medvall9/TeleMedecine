import { apiClient, unwrap } from "./apiClient"
import type { Medicament, Ordonnance } from "@/types/patient.types"

export const prescriptionService = {
  getAll: () => unwrap(apiClient.get<Ordonnance[]>("/ordonnances/ordonnances/")),
  getById: (id: number) => unwrap(apiClient.get<Ordonnance>(`/ordonnances/ordonnances/${id}/`)),
  create: (payload: Partial<Ordonnance>) =>
    unwrap(apiClient.post<Ordonnance>("/ordonnances/ordonnances/", payload)),
  update: (id: number, payload: Partial<Ordonnance>) =>
    unwrap(apiClient.patch<Ordonnance>(`/ordonnances/ordonnances/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/ordonnances/ordonnances/${id}/`)),

  getMedicaments: () => unwrap(apiClient.get<Medicament[]>("/ordonnances/medicaments/")),
  createMedicament: (payload: Partial<Medicament>) =>
    unwrap(apiClient.post<Medicament>("/ordonnances/medicaments/", payload)),
  updateMedicament: (id: number, payload: Partial<Medicament>) =>
    unwrap(apiClient.patch<Medicament>(`/ordonnances/medicaments/${id}/`, payload)),
  removeMedicament: (id: number) => unwrap(apiClient.delete(`/ordonnances/medicaments/${id}/`)),
}
