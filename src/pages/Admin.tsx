import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { matches as initialMatches, type Match } from "../data/mundial"
import { useAuth } from "../context/AuthContext"

export default function Admin() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [form, setForm] = useState({ home: "", away: "", homeScore: "", awayScore: "", date: "", stage: "Fase de grupos" })

  const isAdmin = user?.role === "administrador"

  const addMatch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.home || !form.away) return
    const hasScore = form.homeScore !== "" && form.awayScore !== ""
    const newMatch: Match = {
      id: Date.now(),
      home: form.home,
      away: form.away,
      homeScore: hasScore ? Number(form.homeScore) : null,
      awayScore: hasScore ? Number(form.awayScore) : null,
      date: form.date || new Date().toISOString().slice(0, 10),
      stage: form.stage,
      status: hasScore ? "Finalizado" : "Programado",
    }
    setMatches([newMatch, ...matches])
    setForm({ home: "", away: "", homeScore: "", awayScore: "", date: "", stage: "Fase de grupos" })
  }

  const removeMatch = (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este partido?")) {
      setMatches(matches.filter((m) => m.id !== id))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Panel administrativo</h1>
        <p className="text-sm text-muted-foreground">Administración de resultados y partidos.</p>
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          ⚠️ Solo administradores pueden gestionar partidos. Inicia sesión como admin.
        </div>
      )}

      {isAdmin ? (
        <form onSubmit={addMatch} className="rounded-xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">Registrar partido</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={form.home} onChange={(e) => setForm({ ...form, home: e.target.value })} placeholder="Local" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.away} onChange={(e) => setForm({ ...form, away: e.target.value })} placeholder="Visitante" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.homeScore} onChange={(e) => setForm({ ...form, homeScore: e.target.value })} type="number" min="0" placeholder="Goles local" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <input value={form.awayScore} onChange={(e) => setForm({ ...form, awayScore: e.target.value })} type="number" min="0" placeholder="Goles visitante" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
              <option>Fase de grupos</option>
              <option>Octavos de final</option>
              <option>Cuartos de final</option>
              <option>Semifinal</option>
              <option>Final</option>
            </select>
          </div>
          <button type="submit" className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            <Plus size={16} /> Agregar partido
          </button>
        </form>
      ) : (
        <div className="rounded-lg border border-muted bg-muted p-6 text-center text-sm text-muted-foreground">
          Acceso denegado. Solo administradores pueden ver la lista de partidos.
        </div>
      )}

      {isAdmin && (
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted text-left text-muted-foreground">
            <tr>
              <th className="p-3">Partido</th>
              <th className="p-3 text-center">Marcador</th>
              <th className="p-3">Fase</th>
              <th className="p-3">Fecha</th>
              <th className="p-3 text-center">Estado</th>
              {isAdmin && <th className="p-3 text-center">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 font-medium">{m.home} vs {m.away}</td>
                <td className="p-3 text-center">
                  {m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : "—"}
                </td>
                <td className="p-3">{m.stage}</td>
                <td className="p-3">{m.date}</td>
                <td className="p-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "Finalizado" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-3 text-center">
                    <button onClick={() => removeMatch(m.id)} className="text-destructive hover:opacity-70" aria-label="Eliminar partido">
                      <Trash2 size={16} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}
