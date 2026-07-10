import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      {/* El Navbar ya tiene try/catch interno, no romperá */}
      <Navbar /> 
      
      <main style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', padding: '10px' }}>
        <Routes>
          {/* 🔓 RUTAS PÚBLICAS BÁSICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* 🛡️ RUTA PROTEGIDA DE ADMINISTRACIÓN */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* RUTA DE RESPALDO: Si escribes cualquier otra cosa, te manda al Home en lugar de quedarse en blanco */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}