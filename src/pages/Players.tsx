import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"
import { players as fallbackPlayers, type Player } from "../data/mundial"

export default function Players() {
  const [players, setPlayers] = useState<Player[]>(fallbackPlayers)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPlayers() {
      try {
        const data = await apiFetch<Player[]>("/api/players")
        if (Array.isArray(data) && data.length > 0) {
          setPlayers(data)
        }
      } catch (err) {
        console.error("Error al cargar jugadores de MongoDB:", err)
      } finally {
        setLoading(false)
      }
    }
    void loadPlayers()
  }, [])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando jugadores...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Estadísticas de jugadores</h1>
        <p className="text-sm text-muted-foreground">Máximos anotadores y asistentes del torneo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {players
          .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
          .map((player) => (
            <div key={player.id} className="rounded-xl border bg-card p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{player.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{player.position}</p>
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {player.team}
                </span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{player.goals}</p>
                  <p className="text-xs text-muted-foreground">Goles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{player.assists}</p>
                  <p className="text-xs text-muted-foreground">Asistencias</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}