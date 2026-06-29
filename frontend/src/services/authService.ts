import { apiClient, unwrap } from "./apiClient"
import type {
  AuthTokens,
  ChangePasswordPayload,
  LoginCredentials,
  RegisterPayload,
  User,
} from "@/types/user.types"
import { clearTokens, setTokens } from "@/utils/tokenStorage"

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const tokens = await unwrap(apiClient.post<AuthTokens>("/token/", credentials))
    setTokens(tokens.access, tokens.refresh)
    return tokens
  },

  async register(payload: RegisterPayload): Promise<User> {
    return unwrap(apiClient.post<User>("/users/register/", payload))
  },

  async getProfile(): Promise<User> {
    return unwrap(apiClient.get<User>("/users/profile/"))
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    return unwrap(apiClient.post<{ message: string }>("/users/change-password/", payload))
  },

  logout(): void {
    clearTokens()
  },
}
