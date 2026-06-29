import { apiClient, unwrap } from "./apiClient"
import type { Notification } from "@/types/patient.types"

export const notificationService = {
  getAll: () => unwrap(apiClient.get<Notification[]>("/notifications/")),
  getById: (id: number) => unwrap(apiClient.get<Notification>(`/notifications/${id}/`)),
  create: (payload: Pick<Notification, "titre" | "message" | "type">) =>
    unwrap(apiClient.post<Notification>("/notifications/", payload)),
  update: (id: number, payload: Partial<Notification>) =>
    unwrap(apiClient.patch<Notification>(`/notifications/${id}/`, payload)),
  markAsRead: (id: number) =>
    unwrap(apiClient.patch<Notification>(`/notifications/${id}/`, { est_lu: true })),
  remove: (id: number) => unwrap(apiClient.delete(`/notifications/${id}/`)),
}
