import { useEffect, useState } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import { players as fallbackPlayers, type Player } from "../data/mundial"

export default function Players() {
  const [query, setQuery] = useState("")
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "players"),
      (snap) => {
        const next = snap.docs.map((docSnap) => ({ ...(docSnap.data() as Player), id: Number(docSnap.id) }))
        if (next.length > 0) {
          setPlayers(next)
        }
        setLoading(false)
        setError("")
      },
      (err) => {
        console.error("Error al cargar jugadores desde Firestore", err)
        setError("No se pudieron cargar los jugadores desde la base de datos")
        setLoading(false)
      },
    )

    return () => unsub()
  }, [])

  const sorted = [...players].sort((a, b) => b.goals - a.goals)
  const filtered = sorted.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.team.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estadísticas de jugadores</h1>
          <p className="text-sm text-muted-foreground">Goleadores y asistencias del torneo.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar jugador o equipo..."
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-lg border border-muted bg-muted/50 p-8 text-center text-muted-foreground">
            Cargando datos desde la API propia...
          </div>
        ) : error ? (
          <div className="col-span-full rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-muted bg-muted/50 p-8 text-center text-muted-foreground">
            No se encontraron jugadores.
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{p.name}</h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{p.position}</span>
            </div>
            <p className="text-sm text-muted-foreground">{p.team}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-primary p-2 text-primary-foreground">
                <div className="text-lg font-bold">{p.goals}</div>
                <div className="text-xs opacity-80">Goles</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-lg font-bold">{p.assists}</div>
                <div className="text-xs text-muted-foreground">Asist.</div>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <div className="text-lg font-bold">{p.matches}</div>
                <div className="text-xs text-muted-foreground">PJ</div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  )
}
