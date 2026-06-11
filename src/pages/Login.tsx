import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { LogIn } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const result = login(email, password)
    if (result.success) {
      navigate("/")
    } else {
      setError(result.error || "Error al iniciar sesión.")
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-primary p-2 text-primary-foreground">
            <LogIn size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Accede a predicciones y administración.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary"
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">Tip: Debes estar registrado. Para admin, usa correo que empiece con "admin".</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  )
}
