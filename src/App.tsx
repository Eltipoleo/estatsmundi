import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute'; // Ajusta la ruta si tu archivo está en otra carpeta

// Páginas de relleno por si tienes pestañas comunes creadas
const Equipos = () => <div style={{ padding: '20px' }}><h2>Sección Equipos</h2></div>;
const Jugadores = () => <div style={{ padding: '20px' }}><h2>Sección Jugadores</h2></div>;
const Predicciones = () => <div style={{ padding: '20px' }}><h2>Sección Predicciones</h2></div>;

export default function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc' }}>
        <Routes>
          {/* 🔓 RUTAS PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/predicciones" element={<Predicciones />} />

          {/* 🛡️ RUTAS PROTEGIDAS (Solo entran administradores autenticados) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}