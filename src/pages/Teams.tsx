import { useEffect, useState } from 'react';

interface Team {
  _id: string;
  name: string;
  points: number;
}

export default function Equipos() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = 'https://estatsmundi.onrender.com/api';

  useEffect(() => {
    fetch(`${API_URL}/teams`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) => (b.points || 0) - (a.points || 0));
          setTeams(sorted);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <h2 style={{ color: '#0b6e4f', margin: '0 0 20px 0' }}>🏆 Tabla General de Equipos</h2>
        
        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando listado de escuadras...</p>
        ) : teams.length === 0 ? (
          <p style={{ color: '#64748b' }}>No hay equipos registrados por el administrador.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '600' }}>
                <th style={{ padding: '12px', width: '60px', textAlign: 'center' }}>Posición</th>
                <th style={{ padding: '12px' }}>Club / Selección</th>
                <th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>Puntos Totales</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, idx) => (
                <tr key={team._id} style={{ borderBottom: '1px solid #f1f5f9', background: idx === 0 ? '#f0fdf4' : idx % 2 === 0 ? '#f8fafc' : '#fff' }}>
                  <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold', color: idx === 0 ? '#166534' : '#64748b' }}>{idx + 1}</td>
                  <td style={{ padding: '14px', fontWeight: idx === 0 ? '600' : 'normal' }}>{team.name}</td>
                  <td style={{ padding: '14px', textAlign: 'center', fontWeight: 'bold' }}>{team.points} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}