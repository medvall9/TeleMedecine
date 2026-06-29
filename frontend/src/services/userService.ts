import { apiClient, unwrap } from "./apiClient"
import type { User } from "@/types/user.types"

export const userService = {
  getAll: () => unwrap(apiClient.get<User[]>("/users/")),
  getById: (id: number) => unwrap(apiClient.get<User>(`/users/${id}/`)),
  create: (payload: Partial<User> & { password?: string }) =>
    unwrap(apiClient.post<User>("/users/", payload)),
  update: (id: number, payload: Partial<User>) =>
    unwrap(apiClient.patch<User>(`/users/${id}/`, payload)),
  remove: (id: number) => unwrap(apiClient.delete(`/users/${id}/`)),
}
