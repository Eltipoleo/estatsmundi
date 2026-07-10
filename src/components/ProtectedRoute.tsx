import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  let isAdmin = false;

  if (token && userRaw) {
    try {
      const user = JSON.parse(userRaw);
      // Validamos de forma segura que exista el rol
      if (user && (user.role === 'administrador' || user.role === 'admin')) {
        isAdmin = true;
      }
    } catch (e) {
      console.error("⚠️ Error al parsear el usuario en ProtectedRoute, limpiando residuo:", e);
      // Si el JSON estaba corrupto, limpiamos el localStorage para evitar bucles de pantalla en blanco
      localStorage.removeItem('user');
    }
  }

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}