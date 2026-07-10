import React, { useState } from 'react';

export default function Admin() {
  // Estados para el formulario de Equipos
  const [teamName, setTeamName] = useState('');
  const [teamPoints, setTeamPoints] = useState('');

  // Estados para el formulario de Jugadores (Goleadores)
  const [playerName, setPlayerName] = useState('');
  const [playerTeam, setPlayerTeam] = useState('');
  const [playerGoals, setPlayerGoals] = useState('');

  // Estados para el formulario de Partidos
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');

  // Estados para el manejo de carga y mensajes
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  
  // URL base de tu backend en Render. Cámbiala si tu subdominio es distinto.
  const API_URL = 'https://estatsmundi.onrender.com/api';

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamPoints) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: teamName,
          points: Number(teamPoints),
          logo: ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ Equipo agregado exitosamente a la tabla general.');
        setTeamName('');
        setTeamPoints('');
      } else {
        alert(`❌ Error del servidor: ${data.error || 'No se pudo guardar.'}`);
      }
    } catch (err) {
      console.error('Error al agregar equipo:', err);
      alert('❌ Error de conexión con el backend en Render.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName || !playerTeam || !playerGoals) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: playerName,
          team: playerTeam,
          goals: Number(playerGoals),
          photo: ''
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('⚽ Jugador registrado exitosamente en la tabla de goleadores.');
        setPlayerName('');
        setPlayerTeam('');
        setPlayerGoals('');
      } else {
        alert(`❌ Error del servidor: ${data.error || 'No se pudo guardar.'}`);
      }
    } catch (err) {
      console.error('Error al agregar jugador:', err);
      alert('❌ Error de conexión con el backend en Render.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam || !awayTeam || !homeScore || !awayScore) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
          status: 'completed'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('🏆 Partido y marcador guardados correctamente.');
        setHomeTeam('');
        setAwayTeam('');
        setHomeScore('');
        setAwayScore('');
      } else {
        alert(`❌ Error del servidor: ${data.error || 'No se pudo guardar.'}`);
      }
    } catch (err) {
      console.error('Error al agregar partido:', err);
      alert('❌ Error de conexión con el backend en Render.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #0b6e4f', paddingBottom: '15px' }}>
        <h1 style={{ color: '#0b6e4f', margin: 0, fontSize: '28px' }}>Panel de Administración General</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' }}>Mundial Stats — Configuración y carga de datos en MongoDB Atlas</p>
      </header>

      {/* SECCIÓN FORMULARIO EQUIPOS */}
      <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Agregar Equipo (Tabla General)</h2>
        <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <input type="text" placeholder="Ej. México, Club América, Argentina..." value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            <input type="number" placeholder="Puntos" value={teamPoints} onChange={e => setTeamPoints(e.target.value)} required min="0" style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Guardando...' : 'Insertar Equipo en la Tabla'}
          </button>
        </form>
      </section>

      {/* SECCIÓN FORMULARIO JUGADORES (GOLEADORES) */}
      <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '25px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>⚽ Registrar Goleador (Top Anotadores)</h2>
        <form onSubmit={handleAddPlayer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <input type="text" placeholder="Nombre del Jugador" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            <input type="text" placeholder="Club o Selección" value={playerTeam} onChange={e => setPlayerTeam(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            <input type="number" placeholder="Goles Totales" value={playerGoals} onChange={e => setPlayerGoals(e.target.value)} required min="0" style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>
          <button type="submit" disabled={loading} style={{ background: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Guardando...' : 'Dar de Alta Goleador'}
          </button>
        </form>
      </section>

      {/* SECCIÓN FORMULARIO PARTIDOS */}
      <section style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)' }}>
        <h2 style={{ marginTop: 0, fontSize: '18px', color: '#0f172a', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>🏆 Cargar Resultado de Partido</h2>
        <form onSubmit={handleAddMatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
            {/* Lado Local */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input type="text" placeholder="Equipo Local" value={homeTeam} onChange={e => setHomeTeam(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <input type="number" placeholder="Marcador Local" value={homeScore} onChange={e => setHomeScore(e.target.value)} required min="0" style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', textAlign: 'center' }} />
            </div>

            <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '16px' }}>VS</div>

            {/* Lado Visitante */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input type="text" placeholder="Equipo Visitante" value={awayTeam} onChange={e => setAwayTeam(e.target.value)} required style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
              <input type="number" placeholder="Marcador Visitante" value={awayScore} onChange={e => setAwayScore(e.target.value)} required min="0" style={{ padding: '10px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', textAlign: 'center' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ background: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Procesando...' : 'Cerrar y Guardar Partido'}
          </button>
        </form>
      </section>
    </div>
  );
}