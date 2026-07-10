import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Predictions from './pages/Predictions';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Navbar /> 
      <main style={{ minHeight: 'calc(100vh - 64px)', background: '#f8fafc', padding: '10px' }}>
        <Routes>
          {/* 🔓 PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/equipos" element={<Teams />} />
          <Route path="/jugadores" element={<Players />} />
          <Route path="/predicciones" element={<Predictions />} />

          {/* 🛡️ PROTECTED ADMIN ROUTE */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* FALLBACK COMODÍN */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </Router>
  );
}