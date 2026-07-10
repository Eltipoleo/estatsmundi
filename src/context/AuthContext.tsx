import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiFetch, getStoredToken, setStoredToken, clearStoredToken, parseJwtToken, type AuthUser } from "../lib/api"

type AuthResult = { success: boolean; error?: string }

type AuthContextType = {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (name: string, email: string, password: string) => Promise<AuthResult>
  logout: () => Promise<void>
  sendVerificationEmail: () => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Validar sesión inicial al cargar la app usando el Token JWT almacenado
  useEffect(() => {
    async function checkAuth() {
      const token = getStoredToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      // Decodificación inicial local rápida para no mostrar parpadeos en la UI
      const localUser = parseJwtToken<AuthUser>(token)
      if (localUser) {
        setUser(localUser)
      }

      try {
        // Validar el token contra el endpoint backend /api/auth/me
        const res = await apiFetch<{ user: AuthUser }>("/api/auth/me")
        if (res?.user) {
          setUser(res.user)
        } else {
          clearStoredToken()
          setUser(null)
        }
      } catch (err) {
        console.error("Error al verificar la autenticación:", err)
        // Si el token expiró o es inválido, limpiamos la sesión
        clearStoredToken()
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Email y contraseña son requeridos." }
    }
    if (!validateEmail(trimmedEmail)) return { success: false, error: "Email no válido." }

    try {
      // Petición POST a tu endpoint de Node + MongoDB
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      })

      if (data?.token && data?.user) {
        setStoredToken(data.token)
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: "Respuesta de servidor inválida." }
    } catch (err: any) {
      return { success: false, error: err.message || "Error al iniciar sesión." }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Todos los campos son requeridos." }
    }
    if (!validateEmail(trimmedEmail)) return { success: false, error: "Email no válido." }
    if (trimmedPassword.length < 6) return { success: false, error: "La contraseña debe tener al menos 6 caracteres." }

    try {
      // Petición POST a tu endpoint de registro con MongoDB
      const data = await apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName, email: trimmedEmail, password: trimmedPassword }),
      })

      if (data?.token && data?.user) {
        setStoredToken(data.token)
        setUser(data.user)
        return { success: true }
      }
      return { success: false, error: "Error al procesar el registro." }
    } catch (err: any) {
      return { success: false, error: err.message || "Error al registrar el usuario." }
    }
  }

  const logout = async () => {
    clearStoredToken()
    setUser(null)
  }

  // Métodos marcados como legacy (Opcionales con MongoDB, configurables según requieras)
  const sendVerificationEmail = async (): Promise<AuthResult> => {
    return { success: false, error: "Verificación de email no disponible temporalmente en este método." }
  }

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const trimmedEmail = email.trim()
    if (!trimmedEmail) return { success: false, error: "El correo es requerido." }
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email: trimmedEmail }),
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || "Error al solicitar restablecimiento." }
    }
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, sendVerificationEmail, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}