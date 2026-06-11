import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Teams from "./pages/Teams"
import Players from "./pages/Players"
import Predictions from "./pages/Predictions"
import Admin from "./pages/Admin"
import type { ReactNode } from "react"

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/equipos" element={<Teams />} />
          <Route path="/jugadores" element={<Players />} />
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
              <Protected>
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
