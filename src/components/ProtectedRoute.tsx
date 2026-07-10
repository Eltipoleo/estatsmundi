import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  let isAdmin = false;

  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      // Validamos estrictamente que el rol sea administrador
      if (user.role === 'administrador' || user.role === 'admin') {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Error al verificar el rol en el guardián de rutas:", e);
    }
  }

  // 🛡️ Si es admin, lo dejamos pasar al componente (Outlet), si no, lo mandamos al login
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}