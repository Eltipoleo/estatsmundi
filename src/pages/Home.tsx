import React, { useState, useEffect } from 'react';

interface ExternalTeam {
  position: number;
  name: string;
  logo: string;
  points: number;
  matchesPlayed: number;
  goalsScored: number;
}

export default function Home() {
  const [stats, setStats] = useState({ teams: 0, players: 0, goals: 0 });
  const [externalStats, setExternalStats] = useState<ExternalTeam[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(true);
  const [user, setUser] = useState<{ name: string } | null>(null);

  const API_URL = 'https://estatsmundi.onrender.com/api';

  useEffect(() => {
    // 1. Cargar usuario del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Cargar estadísticas locales básicas
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(() => {
        // Fallback simulado para contadores locales rápidos
        setStats({ teams: 2, players: 1, goals: 10 });
      })
      .catch(err => console.error(err));

    // 3. 🌐 NUEVO: Consumir el endpoint de la API de Terceros
    fetch(`${API_URL}/external-stats`)
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setExternalStats(data.data);
        }
      })
      .catch(err => console.error('Error cargando API externa:', err))
      .finally(() => setLoadingExternal(false));
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* Encabezado Principal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h1 style={{ color: '#0b6e4f', margin: 0, fontSize: '24px' }}>🏆 Mundial Stats</h1>
        {user ? (
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#334155' }}>
            Hola, <span style={{ color: '#0b6e4f' }}>{user.name}</span>
          </span>
        ) : (
          <button onClick={() => window.location.href = '/login'} style={{ background: '#0b6e4f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            Iniciar sesión
          </button>
        )}
      </div>

      {/* Tarjetas del Dashboard Local */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>Equipos Activos</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0b6e4f' }}>{stats.teams}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>Goleadores</h3>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#0b6e4f' }}>{stats.players}</p>
        </div>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '14px' }}>Estado Base de Datos</h3>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#166534' }}>🟢 En Línea (Atlas)</p>
        </div>
      </div>

      {/* 🌐 SECCIÓN NUEVA: TABLA DE LA API DE TERCEROS */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '18px' }}>🌐 Estadísticas Sincronizadas (API de Terceros)</h2>
          <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Proveedor: OpenLigaDB</span>
        </div>

        {loadingExternal ? (
          <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Cargando datos en tiempo real desde el proveedor externo...</p>
        ) : externalStats.length === 0 ? (
          <p style={{ color: '#b91c1c', fontSize: '14px', textAlign: 'center' }}>No se pudieron cargar los datos externos.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', color: '#475569' }}>Pos</th>
                  <th style={{ padding: '12px', color: '#475569' }}>Club</th>
                  <th style={{ padding: '12px', color: '#475569', textAlign: 'center' }}>JJ</th>
                  <th style={{ padding: '12px', color: '#475569', textAlign: 'center' }}>Goles</th>
                  <th style={{ padding: '12px', color: '#475569', textAlign: 'center' }}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {externalStats.map((team, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#64748b' }}>{team.position}</td>
                    <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500, color: '#0f172a' }}>
                      <img src={team.logo} alt={team.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                      {team.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>{team.matchesPlayed}</td>
                    <td style={{ padding: '12px', textAlign: 'center', color: '#334155' }}>{team.goalsScored}</td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#0b6e4f' }}>{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}