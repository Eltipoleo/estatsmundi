import { useEffect, useState } from "react"
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"
import type { Match } from "../data/mundial"

type PredictionValue = { homeScore: number; awayScore: number }

export default function Predictions() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [values, setValues] = useState<Record<number, PredictionValue>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [message, setMessage] = useState("")

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "matches"), (snap) => {
      const nextMatches = snap.docs
        .map((docSnap) => ({ ...(docSnap.data() as Match), id: Number(docSnap.id) }))
        .filter((match) => match.status === "Programado")
        .sort((a, b) => a.date.localeCompare(b.date))
      setMatches(nextMatches)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return

    const loadPredictions = async () => {
      const nextValues: Record<number, PredictionValue> = {}
      for (const match of matches) {
        const snap = await getDoc(doc(db, "users", user.uid, "predictions", String(match.id)))
        if (snap.exists()) {
          const data = snap.data() as PredictionValue
          nextValues[match.id] = data
        }
      }
      setValues(nextValues)
    }

    void loadPredictions()
  }, [matches, user])

  const handleSave = async (match: Match) => {
    if (!user) return

    const current = values[match.id]
    if (current == null) return

    setSaving((prev) => ({ ...prev, [match.id]: true }))
    await setDoc(doc(db, "users", user.uid, "predictions", String(match.id)), {
      matchId: match.id,
      homeScore: current.homeScore,
      awayScore: current.awayScore,
      updatedAt: new Date().toISOString(),
    })
    setMessage(`Tu predicción para ${match.home} vs ${match.away} fue guardada.`)
    setSaving((prev) => ({ ...prev, [match.id]: false }))
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
