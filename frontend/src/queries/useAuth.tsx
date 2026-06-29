"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { authService } from "@/services/authService"
import type { LoginCredentials, RegisterPayload, User } from "@/types/user.types"
import { getErrorMessage } from "@/services/apiClient"
import { hasTokens } from "@/utils/tokenStorage"

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!hasTokens()) {
      setUser(null)
      return
    }
    const profile = await authService.getProfile()
    setUser(profile)
  }, [])

  useEffect(() => {
    refreshProfile()
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false))
  }, [refreshProfile])

  const login = useCallback(async (credentials: LoginCredentials) => {
    await authService.login(credentials)
    await refreshProfile()
  }, [refreshProfile])

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload)
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    window.location.href = "/login"
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, register, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}

export { getErrorMessage }
