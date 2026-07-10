import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail } from "lucide-react"
import { useAuth } from "../context/AuthContext"

export default function ResetPassword() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    const result = await resetPassword(email)
    if (result.success) {
      setMessage("Se envió un correo para restablecer la contraseña.")
      setTimeout(() => navigate("/login"), 3000)
    } else {
      setError(result.error || "Error al enviar el correo de restablecimiento.")
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-lg bg-primary p-2 text-primary-foreground">
            <Mail size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold">Restablecer contraseña</h1>
            <p className="text-sm text-muted-foreground">Recibe un enlace en tu correo para cambiar tu contraseña.</p>
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
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {message && <p className="text-sm text-success">{message}</p>}
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90">
            Enviar enlace
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          ¿Ya recuerdas tu contraseña?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
