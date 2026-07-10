import { Link } from "react-router-dom";
import { Trophy, LogOut, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  
  let user: any = null;
  
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      console.error("⚠️ Error parsing user data in Navbar:", e);
      // Evitamos que rompa el renderizado dejando el usuario como null
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <header style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', sticky: 'top', zIndex: 50 }}>
      <div style={{ margin: '0 auto', display: 'flex', h: '64px', height: '64px', maxWidth: '1100px', alignItems: 'center', justifyContent: 'between', justifyContent: 'space-between', padding: '0 16px' }}>
        
        {/* LOGO */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px', textDecoration: 'none', color: '#0b6e4f' }}>
          <Trophy style={{ height: '20px', width: '20px', color: '#059669' }} />
          <span>Mundial Stats</span>
        </Link>

        {/* NAVEGACIÓN */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '14px', fontWeight: 500 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#1e293b' }}>Inicio</Link>
          <Link to="/equipos" style={{ textDecoration: 'none', color: '#1e293b' }}>Equipos</Link>
          <Link to="/jugadores" style={{ textDecoration: 'none', color: '#1e293b' }}>Jugadores</Link>
          <Link to="/predicciones" style={{ textDecoration: 'none', color: '#1e293b' }}>Predicciones</Link>

          {/* MENÚ DE ADMINISTRACIÓN */}
          {user && (user.role === "administrador" || user.role === "admin") && (
            <Link 
              to="/admin" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                color: '#b45309', 
                backgroundColor: '#fef3c7', 
                padding: '4px 10px', 
                borderRadius: '6px', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              <ShieldAlert style={{ height: '16px', width: '16px' }} />
              <span>Administración</span>
            </Link>
          )}
        </nav>

        {/* AUTENTICACIÓN */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                Hola, <strong>{user?.name || "Usuario"}</strong>
              </span>
              <button
                onClick={handleLogout}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  borderRadius: '8px', 
                  border: '1px solid #cbd5e1', 
                  padding: '6px 12px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#dc2626', 
                  backgroundColor: '#fff', 
                  cursor: 'pointer' 
                }}
              >
                <LogOut style={{ height: '16px', width: '16px' }} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{ 
                borderRadius: '8px', 
                backgroundColor: '#0b6e4f', 
                padding: '8px 16px', 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#fff', 
                textDecoration: 'none' 
              }}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}