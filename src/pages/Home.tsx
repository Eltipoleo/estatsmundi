import { useEffect, useState } from 'react';

interface Team {
  _id: string;
  name: string;
  points: number;
}

interface Player {
  _id: string;
  name: string;
  team: string;
  goals: number;
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://estatsmundi.onrender.com/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Obtener lista de equipos con validación estricta
        const teamsRes = await fetch(`${API_URL}/teams`);
        const teamsData = await teamsRes.json();
        
        if (teamsData && Array.isArray(teamsData)) {
          const sortedTeams = [...teamsData].sort((a, b) => (b.points || 0) - (a.points || 0));
          setTeams(sortedTeams);
        } else {
          setTeams([]);
        }

        // 2. Obtener lista de jugadores goleadores con validación estricta
        const playersRes = await fetch(`${API_URL}/players`);
        const playersData = await playersRes.json();
        
        if (playersData && Array.isArray(playersData)) {
          const sortedPlayers = [...playersData].sort((a, b) => (b.goals || 0) - (a.goals || 0));
          setPlayers(sortedPlayers);
        } else {
          setPlayers([]);
        }
      } catch (err) {
        console.error('Error al sincronizar datos del Home:', err);
        setTeams([]);
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Cálculo seguro del total de goles
  const totalGoals = Array.isArray(players) 
    ? players.reduce((acc, curr) => acc + (Number(curr.goals) || 0), 0) 
    : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '25px', fontFamily: 'sans-serif', color: '#1e293b' }}>
      
      {/* 🟢 BLOC SUPERIOR DE CONTADORES EN TIEMPO REAL */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0b6e4f' }}>{loading ? '...' : teams.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Equipos Activos</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0b6e4f' }}>{loading ? '...' : players.length}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Goleadores Registrados</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0b6e4f' }}>{loading ? '...' : totalGoals}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>Goles Totales</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '15px', textAlign: 'center', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0b6e4f' }}>En Línea</div>
          <div style={{ fontSize: '12px', color: '#0b6e4f', fontWeight: 'bold', marginTop: '4px' }}>● Base de Datos</div>
        </div>
      </div>

      {/* 🔵 SECCIÓN DE TABLAS PRINCIPALES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
        
        {/* PANEL GOLEADORES */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0b6e4f', fontSize: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            ⚽ Goleadores (Top 5 Máximos Anotadores)
          </h3>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando estadísticas de jugadores...</p>
          ) : !players || players.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No hay goleadores guardados en la base de datos por el administrador.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '8px 10px' }}>Jugador</th>
                  <th style={{ padding: '8px 10px' }}>Equipo o Club</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>Goles</th>
                </tr>
              </thead>
              <tbody>
                {players.slice(0, 5).map((player, idx) => (
                  <tr key={player._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '12px 10px', fontWeight: '600' }}>{player.name}</td>
                    <td style={{ padding: '12px 10px', color: '#64748b' }}>{player.team}</td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', color: '#0b6e4f', fontSize: '15px' }}>{player.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PANEL TABLA DE POSICIONES */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0b6e4f', fontSize: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
            📈 Líderes del Torneo (Puntos por Equipo)
          </h3>
          {loading ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>Cargando posiciones del torneo...</p>
          ) : !teams || teams.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '14px' }}>No hay puntuaciones registradas en este momento.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                  <th style={{ padding: '8px 10px', width: '50px', textAlign: 'center' }}>Pos</th>
                  <th style={{ padding: '8px 10px' }}>Club / Selección</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '80px' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, idx) => (
                  <tr key={team._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx === 0 ? '#f0fdf4' : idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', color: idx === 0 ? '#166534' : '#64748b' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: idx === 0 ? '600' : 'normal', color: idx === 0 ? '#166534' : '#1e293b' }}>
                      {team.name}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 'bold', color: '#0f172a' }}>
                      {team.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}