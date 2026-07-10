import React, { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://estatsmundi.onrender.com/api';

  // 🧹 LIMPIEZA AUTOMÁTICA AL ENTRAR AL LOGIN
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciales incorrectas');
      }

      // 🛡️ SI LA CUENTA NO ESTÁ ACTIVADA, DETENER EL ACCESO
      if (data.user && data.user.emailVerified === false) {
        throw new Error('Tu cuenta aún no ha sido activada. Por favor, revisa tu correo electrónico.');
      }

      // 🏆 MAPEO ESTRICTO PARA EVITAR EL "Hola, Usuario"
      const safeUser = {
        name: data.user?.name || 'Usuario Registrado', // Toma el nombre real desde MongoDB
        email: data.user?.email || email.toLowerCase(),
        role: data.user?.role || 'usuario'
      };

      // Forzar rol de administrador en cliente si es tu correo maestro
      if (email.toLowerCase() === 'joserty83@gmail.com') {
        safeUser.role = 'administrador';
      }

      // Guardar sesión limpia
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(safeUser));

      // Redireccionar al Home actualizando el estado de la aplicación
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
      setError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '35px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#0b6e4f', margin: '0 0 8px 0' }}>Mundial Stats</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>Ingresa tus credenciales para acceder</p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '15px', fontWeight: 500, lineHeight: '1.4' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Correo electrónico</label>
            <input type="email" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Contraseña</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </div>

          <button type="submit" disabled={loading} style={{ backgroundColor: '#0b6e4f', color: '#fff', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Validando...' : 'Iniciar sesión'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>¿No tienes una cuenta activa?</p>
          <button 
            onClick={() => window.location.href = '/register'} 
            style={{ background: 'none', border: 'none', color: '#0b6e4f', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
          >
            Registrarse en la plataforma
          </button>
        </div>

      </div>
    </div>
  );
}