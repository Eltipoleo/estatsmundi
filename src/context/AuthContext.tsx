import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  name: string
  email: string
  role: "usuario" | "administrador"
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  register: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const STORAGE_KEY = "mundial_users"
const SESSION_KEY = "mundial_session"

function getStoredUsers(): User[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        setUser(JSON.parse(saved))
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  }, [user])

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const login = (email: string, password: string) => {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Email y contraseña son requeridos." }
    }

    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: "Email no válido." }
    }

    if (trimmedPassword.length < 6) {
      return { success: false, error: "Contraseña debe tener al menos 6 caracteres." }
    }

    const users = getStoredUsers()
    const foundUser = users.find((u) => u.email === trimmedEmail)

    if (!foundUser) {
      return { success: false, error: "Usuario no registrado." }
    }

    setUser(foundUser)
    return { success: true }
  }

  const register = (name: string, email: string, password: string) => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Todos los campos son requeridos." }
    }

    if (!validateEmail(trimmedEmail)) {
      return { success: false, error: "Email no válido." }
    }

    if (trimmedPassword.length < 6) {
      return { success: false, error: "Contraseña debe tener al menos 6 caracteres." }
    }

    const users = getStoredUsers()
    if (users.some((u) => u.email === trimmedEmail)) {
      return { success: false, error: "Este email ya está registrado." }
    }

    const newUser: User = {
      name: trimmedName,
      email: trimmedEmail,
      role: trimmedEmail.toLowerCase().startsWith("admin") ? "administrador" : "usuario",
    }

    saveUsers([...users, newUser])
    setUser(newUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
