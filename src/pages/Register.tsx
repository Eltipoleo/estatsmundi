import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { UserPlus } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const result = await register(name, email, password)
    if (result.success) {
      navigate("/")
    } else {
      setError(result.error || "Error al registrarse.")
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-primary p-2 text-primary-foreground">
            <UserPlus size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">Regístrate para usar el sistema.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-lg border bg-background px-3 py-2 outline-none focus:border-primary"
              required
            />
          </div>
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
            <p className="mt-1 text-xs text-muted-foreground">Usa tu correo electrónico principal para crear tu perfil de usuario.</p>
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
            <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">
            Registrarme
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}