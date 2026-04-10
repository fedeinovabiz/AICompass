import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './stores/authStore';

export default function App() {
  const { token, loadUser } = useAuthStore();

  useEffect(() => {
    if (token) void loadUser();
  }, [token, loadUser]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Stubs — M09-M12 reemplazan estos */}
          <Route path="/org/:orgId" element={<div className="p-8 text-white">Organización (pendiente M09)</div>} />
          <Route path="/org/:orgId/sessions" element={<div className="p-8 text-white">Sesiones (pendiente M09)</div>} />
          <Route path="/org/:orgId/sessions/:sessionId" element={<div className="p-8 text-white">Sesión (pendiente M09)</div>} />
          <Route path="/org/:orgId/sessions/:sessionId/review" element={<div className="p-8 text-white">Revisión (pendiente M09)</div>} />
          <Route path="/org/:orgId/maturity" element={<div className="p-8 text-white">Mapa de madurez (pendiente M11)</div>} />
          <Route path="/org/:orgId/diagnostic" element={<div className="p-8 text-white">Diagnóstico (pendiente M11)</div>} />
          <Route path="/org/:orgId/committee/design" element={<div className="p-8 text-white">Diseño comité (pendiente M10)</div>} />
          <Route path="/org/:orgId/committee/constitution" element={<div className="p-8 text-white">Constitución (pendiente M10)</div>} />
          <Route path="/org/:orgId/pilots" element={<div className="p-8 text-white">Pilotos (pendiente M12)</div>} />
          <Route path="/org/:orgId/pilots/:pilotId" element={<div className="p-8 text-white">Piloto detalle (pendiente M12)</div>} />
        </Route>
      </Route>
    </Routes>
  );
}
