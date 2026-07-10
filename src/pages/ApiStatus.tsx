import { useEffect, useState } from "react"

export default function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
        const response = await fetch(`${baseUrl}/api/health`);
        setStatus(response.ok ? "online" : "offline")
      } catch {
        setStatus("offline")
      }
    }

    void checkHealth()
  }, [])

  return (
    <div className="mb-4 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
      <span className={`h-2.5 w-2.5 rounded-full ${status === "online" ? "bg-emerald-500" : status === "offline" ? "bg-rose-500" : "bg-amber-400"}`} />
      {status === "online" && "API propia conectada"}
      {status === "offline" && "API propia desconectada"}
      {status === "checking" && "Comprobando API propia..."}
    </div>
  )
}
