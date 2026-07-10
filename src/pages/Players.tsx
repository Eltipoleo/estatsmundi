import { useEffect, useState } from 'react';

interface Player {
  _id: string;
  name: string;
  team: string;
  goals: number;
}

export default function Jugadores() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'https://estatsmundi.onrender.com/api';

  useEffect(() => {
    fetch(`${API_URL}/players`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => (b.goals || 0) - (a.goals || 0));
          setPlayers(sorted);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <h2 style={{ color: '#0b6e4f', margin: '0 0 20px 0' }}>⚽ Tabla de Goleo Individual</h2>
        
        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando lista de anotadores...</p>
        ) : players.length === 0 ? (
          <p style={{ color: '#64748b' }}>No hay goleadores dados de alta todavía.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                <th style={{ padding: '12px' }}>Jugador</th>
                <th style={{ padding: '12px' }}>Equipo / Procedencia</th>
                <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>Goles Anotados</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, idx) => (
                <tr key={player._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ padding: '14px', fontWeight: '600' }}>{player.name}</td>
                  <td style={{ padding: '14px', color: '#475569' }}>{player.team}</td>
                  <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: '#0b6e4f', fontSize: '16px' }}>{player.goals} Goles</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}