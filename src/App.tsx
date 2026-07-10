import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResetPassword from "./pages/ResetPassword"
import Teams from "./pages/Teams"
import Players from "./pages/Players"
import Predictions from "./pages/Predictions"
import Admin from "./pages/Admin"
import type { ReactNode } from "react"

function Protected({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-muted-foreground">Cargando sesión...</div>
  }

  if (!user) return <Navigate to="/login" replace />
  
  // Usamos un casteo rápido a string para que TypeScript no se queje por los tipos literales
  if (adminOnly && (user.role as string) !== "administrador" && (user.role as string) !== "admin") {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          {/* RUTAS PRINCIPALES Y DE AUTENTICACIÓN LIBRES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* 👈 Corregido a /register para que coincida con tus redirecciones */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/equipos" element={<Teams />} />
          <Route path="/jugadores" element={<Players />} />
          
          {/* RUTAS PROTEGIDAS */}
          <Route
            path="/predicciones"
            element={
              <Protected>
                <Predictions />
              </Protected>
            }
          />
          <Route
            path="/admin"
            element={
              <Protected adminOnly>
                <Admin />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Sistema de Estadísticas y Predicciones del Mundial de Fútbol · Desarrollo Web Integral
      </footer>
    </div>
  )
}