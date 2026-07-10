import { useEffect, useState } from "react"
import { apiFetch } from "../lib/api"
import { teams as fallbackTeams, type Team } from "../data/mundial"

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>(fallbackTeams)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTeams() {
      try {
        const data = await apiFetch<Team[]>("/api/teams")
        if (Array.isArray(data) && data.length > 0) {
          setTeams(data)
        }
      } catch (err) {
        console.error("Error al cargar equipos de MongoDB:", err)
      } finally {
        setLoading(false)
      }
    }
    void loadTeams()
  }, [])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando equipos...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Equipos participantes</h1>
        <p className="text-sm text-muted-foreground">Tabla de posiciones y rendimiento en tiempo real.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Selección</th>
              <th className="px-4 py-3 text-center">PJ</th>
              <th className="px-4 py-3 text-center">G</th>
              <th className="px-4 py-3 text-center">E</th>
              <th className="px-4 py-3 text-center">P</th>
              <th className="px-4 py-3 text-center">GF</th>
              <th className="px-4 py-3 text-center">GC</th>
              <th className="px-4 py-3 text-center font-bold text-primary">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {teams
              .sort((a, b) => b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst))
              .map((team) => (
                <tr key={team.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{team.name}</td>
                  <td className="px-4 py-3 text-center">{team.played}</td>
                  <td className="px-4 py-3 text-center">{team.won}</td>
                  <td className="px-4 py-3 text-center">{team.drawn}</td>
                  <td className="px-4 py-3 text-center">{team.lost}</td>
                  <td className="px-4 py-3 text-center">{team.goalsFor}</td>
                  <td className="px-4 py-3 text-center">{team.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center font-bold text-primary">{team.points}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}