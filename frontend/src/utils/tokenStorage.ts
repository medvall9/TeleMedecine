const ACCESS_KEY = "telemed_access"
const REFRESH_KEY = "telemed_refresh"
const AUTH_COOKIE = "telemed_authed"

function setCookie(name: string, value: string, maxAge?: number) {
  if (typeof document === "undefined") return
  const max = maxAge != null ? `; max-age=${maxAge}` : ""
  document.cookie = `${name}=${value}; path=/${max}; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  setCookie(AUTH_COOKIE, "1", 60 * 60 * 24 * 7)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  deleteCookie(AUTH_COOKIE)
}

export function hasTokens(): boolean {
  return !!getAccessToken()
}
