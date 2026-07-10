export type AuthUser = {
  uid: string
  name: string
  email: string
  role: "usuario" | "administrador"
  emailVerified: boolean
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ""
const TOKEN_KEY = "mundial_stats_token"

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY)
}

function getApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  const cleanedBase = API_BASE_URL.replace(/\/$/, "")
  if (cleanedBase) {
    return `${cleanedBase}${path.startsWith("/") ? "" : "/"}${path}`
  }

  return path.startsWith("/") ? path : `/${path}`
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}) {
  const url = getApiUrl(path)
  const token = getStoredToken()
  const headers = new Headers(options.headers || undefined)

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, { ...options, headers })
  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = body?.error || body?.message || `Request failed with status ${response.status}`
    const error = new Error(message) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return body as T
}

export function parseJwtToken<T>(token: string): T | null {
  try {
    const payload = token.split(".")[1]
    if (!payload) return null

    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    const json = decodeURIComponent(
      decoded
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    )

    return JSON.parse(json) as T
  } catch {
    return null
  }
}
