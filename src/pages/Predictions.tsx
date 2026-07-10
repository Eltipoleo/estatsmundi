import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { apiFetch } from "../lib/api"
import type { Match } from "../data/mundial"

type PredictionValue = { homeScore: number; awayScore: number }

export default function Predictions() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [values, setValues] = useState<Record<number, PredictionValue>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [message, setMessage] = useState("")

  // Cargar los partidos programados desde tu API de MongoDB
  useEffect(() => {
    async function fetchMatches() {
      try {
        const data = await apiFetch<Match[]>("/api/matches")
        if (Array.isArray(data)) {
          const scheduled = data
            .filter((match) => match.status === "Programado")
            .sort((a, b) => a.date.localeCompare(b.date))
          setMatches(scheduled)
        }
      } catch (err) {
        console.error("Error al cargar partidos:", err)
      }
    }
    void fetchMatches()
  }, [])

  // Cargar las predicciones previas guardadas por el usuario en MongoDB
  useEffect(() => {
    if (!user) return

    async function loadPredictions() {
      try {
        // Asumiendo que tu endpoint de predicciones puede retornar las del usuario actual
        const data = await apiFetch<any[]>("/api/predictions")
        if (Array.isArray(data)) {
          const nextValues: Record<number, PredictionValue> = {}
          data.forEach((pred) => {
            nextValues[pred.matchId] = {
              homeScore: pred.homeScore,
              awayScore: pred.awayScore,
            }
          })
          setValues(nextValues)
        }
      } catch (err) {
        console.error("Error al cargar predicciones de MongoDB:", err)
      }
    }

    void loadPredictions()
  }, [matches, user])

  // Guardar la predicción en MongoDB a través del endpoint POST
  const handleSave = async (match: Match) => {
    if (!user) return

    const current = values[match.id]
    if (current == null) return

    setSaving((prev) => ({ ...prev, [match.id]: true }))
    
    try {
      await apiFetch("/api/predictions", {
        method: "POST",
        body: JSON.stringify({
          userId: user.uid,
          matchId: match.id,
          homeScore: current.homeScore,
          awayScore: current.awayScore,
        }),
      })
      setMessage(`Tu predicción para ${match.home} vs ${match.away} fue guardada.`)
    } catch (err: any) {
      console.error(err)
      setMessage("Error al guardar la predicción.")
    } finally {
      setSaving((prev) => ({ ...prev, [match.id]: false }))
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        Inicia sesión para guardar tus predicciones.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Predicciones de partidos</h1>
        <p className="text-sm text-muted-foreground">Guarda tus pronósticos y compáralos con el resultado real.</p>
      </div>

      {message && <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">{message}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match) => {
          const current = values[match.id]
          return (
            <div key={match.id} className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold">{match.home}</span>
                <span className="text-sm text-muted-foreground">vs</span>
                <span className="font-semibold">{match.away}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  value={current?.homeScore ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [match.id]: { homeScore: Number(e.target.value), awayScore: prev[match.id]?.awayScore ?? 0 },
                    }))
                  }
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Goles local"
                />
                <input
                  type="number"
                  min="0"
                  value={current?.awayScore ?? ""}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [match.id]: { homeScore: prev[match.id]?.homeScore ?? 0, awayScore: Number(e.target.value) },
                    }))
                  }
                  className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Goles visitante"
                />
              </div>

              <button
                onClick={() => void handleSave(match)}
                disabled={saving[match.id]}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {saving[match.id] ? "Guardando..." : "Guardar predicción"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}