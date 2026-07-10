import { Link } from "react-router-dom";
import { Trophy, LogOut, ShieldAlert } from "lucide-react";

export default function Navbar() {
  // Leemos directo del LocalStorage para reaccionar al instante
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  
  let user = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch (e) {
      console.error("Error parsing user data:", e);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/"; // Fuerza una limpieza total y manda al Home
  };

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <Trophy className="h-5 w-5 text-emerald-600" />
          <span>Mundial Stats</span>
        </Link>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <Link to="/equipos" className="hover:text-primary transition-colors">Equipos</Link>
          <Link to="/jugadores" className="hover:text-primary transition-colors">Jugadores</Link>
          <Link to="/predicciones" className="hover:text-primary transition-colors">Predicciones</Link>

          {/* ✅ SI ES ADMINISTRADOR, MUESTRA LA PESTAÑA */}
          {user && (user.role === "administrador" || user.role === "admin") && (
            <Link 
              to="/admin" 
              className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Administración</span>
            </Link>
          )}
        </nav>

        {/* SECCIÓN DE BOTONES DE ACCESO */}
        <div className="flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                Hola, <strong>{user?.name || "Usuario"}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}