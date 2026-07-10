import { useEffect, useState } from "react"
import { Activity, CheckCircle, XCircle } from "lucide-react"

export default function ApiStatus() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")

  useEffect(() => {
    async function checkStatus() {
      try {
        // 1. Obtener la URL base desde el entorno o usar local como fallback
        let baseUrl = (import.meta as any).env.VITE_API_BASE_URL || "https://estatsmundi.onrender.com"

        // 2. Limpieza de seguridad: Si la URL termina en subrutas, las removemos para apuntar a la raíz
        if (baseUrl.endsWith("/api/teams")) {
          baseUrl = baseUrl.replace("/api/teams", "")
        }
        if (baseUrl.endsWith("/")) {
          baseUrl = baseUrl.slice(0, -1)
        }

        // 3. Petición directa al endpoint de salud del backend
        const response = await fetch(`${baseUrl}/api/health`)

        if (response.ok) {
          setStatus("online")
        } else {
          setStatus("offline")
        }
      } catch (err) {
        console.error("Error al conectar con el servicio API de Render:", err)
        setStatus("offline")
      }
    }

    void checkStatus()
  }, [])

  if (status === "loading") {
    return (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
        <Activity size={14} className="animate-pulse text-amber-500" />
        <span>Verificando conexión con el servidor...</span>
      </div>
    )
  }

  if (status === "offline") {
    return (
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs text-destructive">
        <XCircle size={14} />
        <span>Servidor Desconectado (Error de API o Base de Datos)</span>
      </div>
    )
  }

  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 font-medium">
      <CheckCircle size={14} />
      <span>Servidor en línea (MongoDB Atlas conectado)</span>
    </div>
  )
}