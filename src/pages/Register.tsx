import React, { useState } from 'react';

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://estatsmundi.onrender.com/api';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nombre.trim(),           // Asegura match con Node.js
          email: correo.trim().toLowerCase(), // Asegura match con Node.js
          password: contrasena.trim(),   // Asegura match con Node.js
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'No se pudo completar el registro.');
      }

      setMessage(data.message || '🏆 ¡Registro completado! Por favor, revisa tu correo electrónico para activar tu cuenta.');
      setNombre('');
      setCorreo('');
      setContrasena('');

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '35px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#0b6e4f', margin: '0' }}>Crear Cuenta</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>Regístrate en la plataforma del Mundial</p>
        </div>

        {message && <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px', borderRadius: '6px', fontSize: '14px', marginBottom: '15px' }}>{message}</div>}
        {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '11px', borderRadius: '6px', fontSize: '14px', marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Nombre de usuario</label>
            <input type="text" placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Contraseña</label>
            <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" disabled={loading} style={{ backgroundColor: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Registrando...' : 'Registrar Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}