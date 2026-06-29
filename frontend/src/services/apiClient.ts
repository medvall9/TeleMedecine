import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/utils/tokenStorage"

const baseURL = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "")

/** Django APPEND_SLASH requires trailing slashes on all API paths. */
function normalizeApiPath(url: string): string {
  const [path, query] = url.split("?")
  const normalized = path.replace(/^\//, "").replace(/\/+$/, "")
  const withSlash = `${normalized}/`
  return query ? `${withSlash}?${query}` : withSlash
}

function isAuthPath(url?: string): boolean {
  if (!url) return false
  const path = normalizeApiPath(url).replace(/\/$/, "")
  return path === "token" || path === "token/refresh"
}

export const apiClient = axios.create({
  baseURL: `${baseURL}/`,
  headers: { "Content-Type": "application/json" },
})

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function processQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.url) {
    config.url = normalizeApiPath(config.url)
  }

  if (isAuthPath(config.url)) {
    delete config.headers.Authorization
    return config
  }

  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && original && !original._retry && !isAuthPath(original.url)) {
      original._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(original))
            } else {
              reject(error)
            }
          })
        })
      }

      isRefreshing = true
      const refresh = getRefreshToken()

      if (!refresh) {
        clearTokens()
        isRefreshing = false
        processQueue(null)
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login"
        }
        return Promise.reject(error)
      }

      try {
        const { data } = await apiClient.post<{ access: string }>("token/refresh/", { refresh })
        setTokens(data.access, refresh)
        processQueue(data.access)
        original.headers.Authorization = `Bearer ${data.access}`
        return apiClient(original)
      } catch {
        clearTokens()
        processQueue(null)
        if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
          window.location.href = "/login"
        }
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : "Une erreur est survenue"
  }

  const data = error.response?.data as Record<string, unknown> | string | undefined

  if (typeof data === "string") {
    if (data.trimStart().startsWith("<!DOCTYPE") || data.trimStart().startsWith("<html")) {
      return "Erreur serveur. Vérifiez que le backend Django est démarré et accessible."
    }
    return data
  }
  if (data && typeof data === "object") {
    if ("detail" in data && typeof data.detail === "string") return data.detail
    if ("error" in data && typeof data.error === "string") return data.error
    const messages = Object.entries(data)
      .map(([key, val]) => {
        if (Array.isArray(val)) return `${key}: ${val.join(", ")}`
        if (typeof val === "string") return `${key}: ${val}`
        return null
      })
      .filter(Boolean)
    if (messages.length) return messages.join(" · ")
  }

  return error.message || "Une erreur est survenue"
}

export async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  const { data } = await promise
  return data
}
