import { useState } from 'react';

export default function Predicciones() {
  const [localScore, setLocalScore] = useState('');
  const [visitanteScore, setVisitanteScore] = useState('');
  const [resultado, setResultado] = useState('');

  const realizarPrediccion = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = Number(localScore);
    const vis = Number(visitanteScore);

    if (loc > vis) {
      setResultado('🔮 Tu predicción: ¡Gana el Equipo Local! 🔥');
    } else if (vis > loc) {
      setResultado('🔮 Tu predicción: ¡Se lleva la victoria el Visitante! 🚀');
    } else {
      setResultado('🔮 Tu predicción: Los equipos firmarán un emocionante Empate 🤝');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', textAlign: 'center' }}>
        <h2 style={{ color: '#0b6e4f', margin: '0 0 10px 0' }}>🔮 Simulador de Predicciones</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>Ingresa tu marcador estimado para calcular el destino del partido</p>

        <form onSubmit={realizarPrediccion} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Goles Local</span>
              <input type="number" min="0" value={localScore} onChange={e => setLocalScore(e.target.value)} required style={{ width: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px' }} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '20px', marginTop: '18px', color: '#cbd5e1' }}>-</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Goles Visitante</span>
              <input type="number" min="0" value={visitanteScore} onChange={e => setVisitanteScore(e.target.value)} required style={{ width: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '16px' }} />
            </div>
          </div>

          <button type="submit" style={{ background: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
            Calcular Predicción
          </button>
        </form>

        {resultado && (
          <div style={{ marginTop: '25px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontWeight: 'bold', fontSize: '15px' }}>
            {resultado}
          </div>
        )}
      </div>
    </div>
  );
}