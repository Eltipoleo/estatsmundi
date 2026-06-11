import { useState } from "react"
import { teams } from "../data/mundial"

export default function Teams() {
  const [query, setQuery] = useState("")
  const sorted = [...teams].sort((a, b) => b.points - a.points)
  const filtered = sorted.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estadísticas de equipos</h1>
          <p className="text-sm text-muted-foreground">Tabla de posiciones del torneo.</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar equipo..."
          className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-muted bg-muted/50 p-8 text-center text-muted-foreground">
          No se encontraron equipos.
        </div>
      ) : (
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-muted-foreground">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Equipo</th>
              <th className="p-3 text-center">Grupo</th>
              <th className="p-3 text-center">PJ</th>
              <th className="p-3 text-center">G</th>
              <th className="p-3 text-center">E</th>
              <th className="p-3 text-center">P</th>
              <th className="p-3 text-center">GF</th>
              <th className="p-3 text-center">GC</th>
              <th className="p-3 text-center font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t, i) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 text-muted-foreground">{i + 1}</td>
                <td className="p-3 font-medium">
                  <span className="mr-2">{t.flag}</span>
                  {t.name}
                </td>
                <td className="p-3 text-center">{t.group}</td>
                <td className="p-3 text-center">{t.played}</td>
                <td className="p-3 text-center">{t.won}</td>
                <td className="p-3 text-center">{t.drawn}</td>
                <td className="p-3 text-center">{t.lost}</td>
                <td className="p-3 text-center">{t.goalsFor}</td>
                <td className="p-3 text-center">{t.goalsAgainst}</td>
                <td className="p-3 text-center font-bold text-primary">{t.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
