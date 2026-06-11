import { Link } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Trophy, Users, Goal, TrendingUp } from "lucide-react"
import { Card, CardHeader, StatBadge } from "../components/Card"
import { teams, players, matches } from "../data/mundial"

const COLORS = ["#0b6e4f", "#e4b343", "#5b6472", "#c0392b"]

export default function Home() {
  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5)
  const goalsData = topScorers.map((p) => ({ name: p.name.split(" ").slice(-1)[0], goles: p.goals }))
  const pointsData = [...teams].sort((a, b) => b.points - a.points).slice(0, 4).map((t) => ({ name: t.name, value: t.points }))
  const totalGoals = teams.reduce((s, t) => s + t.goalsFor, 0)
  const finished = matches.filter((m) => m.status === "Finalizado").length

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border bg-card p-6">
        <h1 className="text-2xl font-bold text-balance md:text-3xl">
          Estadísticas y Predicciones del Mundial de Fútbol
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
          Consulta estadísticas de equipos y jugadores, visualiza gráficas y revisa predicciones
          automáticas basadas en datos históricos.
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/equipos" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Ver equipos
          </Link>
          <Link to="/predicciones" className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">
            Predicciones
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBadge label="Equipos" value={teams.length} accent />
        <StatBadge label="Jugadores" value={players.length} />
        <StatBadge label="Goles totales" value={totalGoals} />
        <StatBadge label="Partidos jugados" value={finished} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Goleadores" subtitle="Top 5 máximos anotadores" icon={<Goal size={18} />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalsData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="goles" fill="#0b6e4f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Puntos por equipo" subtitle="Líderes del torneo" icon={<TrendingUp size={18} />} />
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pointsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {pointsData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link to="/equipos" className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary">
          <Trophy className="text-primary" />
          <h3 className="mt-3 font-semibold">Equipos</h3>
          <p className="text-sm text-muted-foreground">Tabla de posiciones y estadísticas.</p>
        </Link>
        <Link to="/jugadores" className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary">
          <Users className="text-primary" />
          <h3 className="mt-3 font-semibold">Jugadores</h3>
          <p className="text-sm text-muted-foreground">Goles, asistencias y partidos.</p>
        </Link>
        <Link to="/predicciones" className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary">
          <TrendingUp className="text-primary" />
          <h3 className="mt-3 font-semibold">Predicciones</h3>
          <p className="text-sm text-muted-foreground">Probabilidades de resultados.</p>
        </Link>
      </section>
    </div>
  )
}
