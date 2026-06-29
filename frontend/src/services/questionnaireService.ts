import { apiClient, unwrap } from "./apiClient"
import type { Questionnaire } from "@/types/patient.types"

export const questionnaireService = {
  getAll: () => unwrap(apiClient.get<Questionnaire[]>("/questionnaires/")),
  getById: (id: number) => unwrap(apiClient.get<Questionnaire>(`/questionnaires/${id}/`)),
  create: (payload: Partial<Questionnaire>) =>
    unwrap(apiClient.post<Questionnaire>("/questionnaires/", payload)),
  update: (id: number, payload: Partial<Questionnaire>) =>
    unwrap(apiClient.patch<Questionnaire>(`/questionnaires/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/questionnaires/${id}/`)),
}
