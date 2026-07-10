import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2, ShieldCheck, ShieldOff } from "lucide-react"
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../context/AuthContext"
import type { Match, Player, Team } from "../data/mundial"

type Tab = "matches" | "players" | "teams" | "users"

type UserProfile = {
  uid: string
  name: string
  email: string
  role: "usuario" | "administrador"
  emailVerified: boolean
}

export default function Admin() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [activeTab, setActiveTab] = useState<Tab>("matches")
  const [form, setForm] = useState({ home: "", away: "", homeScore: "", awayScore: "", date: "", stage: "Fase de grupos" })
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [playerForm, setPlayerForm] = useState({ name: "", team: "", position: "", goals: "", assists: "", matches: "" })
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamForm, setTeamForm] = useState({ name: "", group: "A", flag: "", played: "", won: "", drawn: "", lost: "", goalsFor: "", goalsAgainst: "", points: "" })

  const isAdmin = user?.role === "administrador"

  useEffect(() => {
    const unsubMatches = onSnapshot(collection(db, "matches"), (snap) => {
      const next = snap.docs
        .map((docSnap) => ({ ...(docSnap.data() as Match), id: Number(docSnap.id) }))
        .sort((a, b) => a.date.localeCompare(b.date))
      setMatches(next)
    })

    const unsubPlayers = onSnapshot(collection(db, "players"), (snap) => {
      const next = snap.docs
        .map((docSnap) => ({ ...(docSnap.data() as Player), id: Number(docSnap.id) }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setPlayers(next)
    })

    const unsubTeams = onSnapshot(collection(db, "teams"), (snap) => {
      const next = snap.docs
        .map((docSnap) => ({ ...(docSnap.data() as Team), id: Number(docSnap.id) }))
        .sort((a, b) => a.name.localeCompare(b.name))
      setTeams(next)
    })

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const next = snap.docs
        .map((docSnap) => ({ ...(docSnap.data() as UserProfile), uid: docSnap.id }))
        .sort((a, b) => a.email.localeCompare(b.email))
      setUsers(next)
    })

    return () => {
      unsubMatches()
      unsubPlayers()
      unsubTeams()
      unsubUsers()
    }
  }, [])

  const addMatch = async (e: React.FormEvent<HTMLFormElement>) => {
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
    await setDoc(doc(db, "matches", String(newMatch.id)), newMatch)
    setForm({ home: "", away: "", homeScore: "", awayScore: "", date: "", stage: "Fase de grupos" })
  }

  const removeMatch = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este partido?")) {
      await deleteDoc(doc(db, "matches", String(id)))
    }
  }

  const updatePlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingPlayer || !playerForm.name || !playerForm.team) return

    await setDoc(doc(db, "players", String(editingPlayer.id)), {
      id: editingPlayer.id,
      name: playerForm.name,
      team: playerForm.team,
      position: playerForm.position,
      goals: Number(playerForm.goals),
      assists: Number(playerForm.assists),
      matches: Number(playerForm.matches),
    })

    setEditingPlayer(null)
    setPlayerForm({ name: "", team: "", position: "", goals: "", assists: "", matches: "" })
  }

  const startEditPlayer = (player: Player) => {
    setEditingPlayer(player)
    setPlayerForm({
      name: player.name,
      team: player.team,
      position: player.position,
      goals: String(player.goals),
      assists: String(player.assists),
      matches: String(player.matches),
    })
  }

  const cancelEditPlayer = () => {
    setEditingPlayer(null)
    setPlayerForm({ name: "", team: "", position: "", goals: "", assists: "", matches: "" })
  }

  const removePlayer = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
      await deleteDoc(doc(db, "players", String(id)))
    }
  }

  const addTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!teamForm.name || !teamForm.flag) return

    const newTeam: Team = {
      id: Date.now(),
      name: teamForm.name,
      group: teamForm.group,
      flag: teamForm.flag,
      played: Number(teamForm.played || 0),
      won: Number(teamForm.won || 0),
      drawn: Number(teamForm.drawn || 0),
      lost: Number(teamForm.lost || 0),
      goalsFor: Number(teamForm.goalsFor || 0),
      goalsAgainst: Number(teamForm.goalsAgainst || 0),
      points: Number(teamForm.points || 0),
    }

    await setDoc(doc(db, "teams", String(newTeam.id)), newTeam)
    setTeamForm({ name: "", group: "A", flag: "", played: "", won: "", drawn: "", lost: "", goalsFor: "", goalsAgainst: "", points: "" })
  }

  const updateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingTeam || !teamForm.name || !teamForm.flag) return

    await setDoc(doc(db, "teams", String(editingTeam.id)), {
      id: editingTeam.id,
      name: teamForm.name,
      group: teamForm.group,
      flag: teamForm.flag,
      played: Number(teamForm.played || 0),
      won: Number(teamForm.won || 0),
      drawn: Number(teamForm.drawn || 0),
      lost: Number(teamForm.lost || 0),
      goalsFor: Number(teamForm.goalsFor || 0),
      goalsAgainst: Number(teamForm.goalsAgainst || 0),
      points: Number(teamForm.points || 0),
    })

    setEditingTeam(null)
    setTeamForm({ name: "", group: "A", flag: "", played: "", won: "", drawn: "", lost: "", goalsFor: "", goalsAgainst: "", points: "" })
  }

  const startEditTeam = (team: Team) => {
    setEditingTeam(team)
    setTeamForm({
      name: team.name,
      group: team.group,
      flag: team.flag,
      played: String(team.played),
      won: String(team.won),
      drawn: String(team.drawn),
      lost: String(team.lost),
      goalsFor: String(team.goalsFor),
      goalsAgainst: String(team.goalsAgainst),
      points: String(team.points),
    })
  }

  const cancelEditTeam = () => {
    setEditingTeam(null)
    setTeamForm({ name: "", group: "A", flag: "", played: "", won: "", drawn: "", lost: "", goalsFor: "", goalsAgainst: "", points: "" })
  }

  const removeTeam = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
      await deleteDoc(doc(db, "teams", String(id)))
    }
  }

  const toggleUserRole = async (targetUser: UserProfile) => {
    if (!user?.uid || targetUser.uid === user.uid) return

    const nextRole: UserProfile["role"] = targetUser.role === "administrador" ? "usuario" : "administrador"
    await setDoc(doc(db, "users", targetUser.uid), {
      uid: targetUser.uid,
      name: targetUser.name,
      email: targetUser.email,
      role: nextRole,
      emailVerified: targetUser.emailVerified,
    }, { merge: true })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Panel administrativo</h1>
        <p className="text-sm text-muted-foreground">Administración de resultados, partidos y estadísticas de jugadores.</p>
      </div>

      {!isAdmin && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          ⚠️ Solo administradores pueden gestionar el panel. Inicia sesión como admin.
        </div>
      )}

      {isAdmin && (
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "matches"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Partidos
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "players"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Jugadores
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "teams"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Equipos
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Usuarios
          </button>
        </div>
      )}

      {isAdmin ? (
        activeTab === "matches" ? (
          <div className="space-y-4">
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

            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted text-left text-muted-foreground">
                  <tr>
                    <th className="p-3">Partido</th>
                    <th className="p-3 text-center">Marcador</th>
                    <th className="p-3">Fase</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3 text-center">Estado</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{m.home} vs {m.away}</td>
                      <td className="p-3 text-center">{m.homeScore !== null ? `${m.homeScore} - ${m.awayScore}` : "—"}</td>
                      <td className="p-3">{m.stage}</td>
                      <td className="p-3">{m.date}</td>
                      <td className="p-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${m.status === "Finalizado" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => void removeMatch(m.id)} className="text-destructive hover:opacity-70" aria-label="Eliminar partido">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "players" ? (
          <div className="space-y-4">
            {editingPlayer ? (
              <form onSubmit={updatePlayer} className="rounded-xl border bg-card p-5">
                <h2 className="mb-4 font-semibold">Editar estadísticas de jugador</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input
                    value={playerForm.name}
                    onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })}
                    placeholder="Nombre"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={playerForm.team}
                    onChange={(e) => setPlayerForm({ ...playerForm, team: e.target.value })}
                    placeholder="Equipo"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={playerForm.position}
                    onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    placeholder="Posición"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={playerForm.goals}
                    onChange={(e) => setPlayerForm({ ...playerForm, goals: e.target.value })}
                    placeholder="Goles"
                    min="0"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={playerForm.assists}
                    onChange={(e) => setPlayerForm({ ...playerForm, assists: e.target.value })}
                    placeholder="Asistencias"
                    min="0"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <input
                    type="number"
                    value={playerForm.matches}
                    onChange={(e) => setPlayerForm({ ...playerForm, matches: e.target.value })}
                    placeholder="Partidos"
                    min="0"
                    className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditPlayer}
                    className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : null}

            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted text-left text-muted-foreground">
                  <tr>
                    <th className="p-3">Jugador</th>
                    <th className="p-3">Equipo</th>
                    <th className="p-3">Posición</th>
                    <th className="p-3 text-center">Goles</th>
                    <th className="p-3 text-center">Asistencias</th>
                    <th className="p-3 text-center">Partidos</th>
                    <th className="p-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{p.name}</td>
                      <td className="p-3">{p.team}</td>
                      <td className="p-3">{p.position}</td>
                      <td className="p-3 text-center">{p.goals}</td>
                      <td className="p-3 text-center">{p.assists}</td>
                      <td className="p-3 text-center">{p.matches}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEditPlayer(p)}
                            className="text-blue-500 hover:opacity-70"
                            aria-label="Editar jugador"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => void removePlayer(p.id)}
                            className="text-destructive hover:opacity-70"
                            aria-label="Eliminar jugador"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === "teams" ? (
          <div className="space-y-4">
            {(editingTeam ? (
              <form onSubmit={updateTeam} className="rounded-xl border bg-card p-5">
                <h2 className="mb-4 font-semibold">Editar equipo</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Nombre" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input value={teamForm.flag} onChange={(e) => setTeamForm({ ...teamForm, flag: e.target.value })} placeholder="Bandera" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <select value={teamForm.group} onChange={(e) => setTeamForm({ ...teamForm, group: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    {['A','B','C','D','E','F','G','H'].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" value={teamForm.played} onChange={(e) => setTeamForm({ ...teamForm, played: e.target.value })} placeholder="PJ" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.won} onChange={(e) => setTeamForm({ ...teamForm, won: e.target.value })} placeholder="G" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.drawn} onChange={(e) => setTeamForm({ ...teamForm, drawn: e.target.value })} placeholder="E" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.lost} onChange={(e) => setTeamForm({ ...teamForm, lost: e.target.value })} placeholder="P" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.goalsFor} onChange={(e) => setTeamForm({ ...teamForm, goalsFor: e.target.value })} placeholder="GF" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.goalsAgainst} onChange={(e) => setTeamForm({ ...teamForm, goalsAgainst: e.target.value })} placeholder="GC" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.points} onChange={(e) => setTeamForm({ ...teamForm, points: e.target.value })} placeholder="Pts" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Guardar cambios</button>
                  <button type="button" onClick={cancelEditTeam} className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
                </div>
              </form>
            ) : (
              <form onSubmit={addTeam} className="rounded-xl border bg-card p-5">
                <h2 className="mb-4 font-semibold">Agregar equipo</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <input value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} placeholder="Nombre" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input value={teamForm.flag} onChange={(e) => setTeamForm({ ...teamForm, flag: e.target.value })} placeholder="Bandera" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <select value={teamForm.group} onChange={(e) => setTeamForm({ ...teamForm, group: e.target.value })} className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    {['A','B','C','D','E','F','G','H'].map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <input type="number" value={teamForm.played} onChange={(e) => setTeamForm({ ...teamForm, played: e.target.value })} placeholder="PJ" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.won} onChange={(e) => setTeamForm({ ...teamForm, won: e.target.value })} placeholder="G" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.drawn} onChange={(e) => setTeamForm({ ...teamForm, drawn: e.target.value })} placeholder="E" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.lost} onChange={(e) => setTeamForm({ ...teamForm, lost: e.target.value })} placeholder="P" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.goalsFor} onChange={(e) => setTeamForm({ ...teamForm, goalsFor: e.target.value })} placeholder="GF" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.goalsAgainst} onChange={(e) => setTeamForm({ ...teamForm, goalsAgainst: e.target.value })} placeholder="GC" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                  <input type="number" value={teamForm.points} onChange={(e) => setTeamForm({ ...teamForm, points: e.target.value })} placeholder="Pts" min="0" className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                </div>
                <button type="submit" className="mt-4 flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"><Plus size={16} /> Agregar equipo</button>
              </form>
            ))}

            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted text-left text-muted-foreground">
                  <tr><th className="p-3">Equipo</th><th className="p-3">Grupo</th><th className="p-3 text-center">PJ</th><th className="p-3 text-center">G</th><th className="p-3 text-center">E</th><th className="p-3 text-center">P</th><th className="p-3 text-center">GF</th><th className="p-3 text-center">GC</th><th className="p-3 text-center">Pts</th><th className="p-3 text-center">Acciones</th></tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3 font-medium">{team.flag} {team.name}</td>
                      <td className="p-3">{team.group}</td>
                      <td className="p-3 text-center">{team.played}</td>
                      <td className="p-3 text-center">{team.won}</td>
                      <td className="p-3 text-center">{team.drawn}</td>
                      <td className="p-3 text-center">{team.lost}</td>
                      <td className="p-3 text-center">{team.goalsFor}</td>
                      <td className="p-3 text-center">{team.goalsAgainst}</td>
                      <td className="p-3 text-center">{team.points}</td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => startEditTeam(team)} className="text-blue-500 hover:opacity-70" aria-label="Editar equipo"><Edit2 size={16} /></button>
                          <button onClick={() => void removeTeam(team.id)} className="text-destructive hover:opacity-70" aria-label="Eliminar equipo"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Gestión de usuarios</h2>
                <p className="text-sm text-muted-foreground">Asigna o revoca permisos de administrador desde aquí.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted text-left text-muted-foreground">
                  <tr>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Correo</th>
                    <th className="p-3 text-center">Rol</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((targetUser) => {
                    const isCurrentUser = targetUser.uid === user?.uid
                    return (
                      <tr key={targetUser.uid} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-3 font-medium">{targetUser.name}</td>
                        <td className="p-3">{targetUser.email}</td>
                        <td className="p-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${targetUser.role === "administrador" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {targetUser.role === "administrador" ? "Administrador" : "Usuario"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => void toggleUserRole(targetUser)}
                            disabled={isCurrentUser}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium ${isCurrentUser ? "cursor-not-allowed bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}
                          >
                            {targetUser.role === "administrador" ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                            {targetUser.role === "administrador" ? "Quitar admin" : "Hacer admin"}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-lg border border-muted bg-muted p-6 text-center text-sm text-muted-foreground">
          Acceso denegado. Solo administradores pueden ver el panel.
        </div>
      )}
    </div>
  )
}
