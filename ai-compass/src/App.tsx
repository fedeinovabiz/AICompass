import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DiagnosticReportPage from './pages/DiagnosticReportPage';
import CommitteeDesignPage from './pages/CommitteeDesignPage';
import CommitteeConstitutionPage from './pages/CommitteeConstitutionPage';
import OrganizationPage from './pages/OrganizationPage';
import SessionListPage from './pages/SessionListPage';
import SessionViewPage from './pages/SessionViewPage';
import TranscriptReviewPage from './pages/TranscriptReviewPage';
import MaturityMapPage from './pages/MaturityMapPage';
import PilotListPage from './pages/PilotListPage';
import PilotDetailPage from './pages/PilotDetailPage';
import ReportBuilderPage from './pages/ReportBuilderPage';
import CouncilDashboardPage from './pages/CouncilDashboardPage';
import ScalingDashboardPage from './pages/ScalingDashboardPage';
import ScalingPlanDetailPage from './pages/ScalingPlanDetailPage';
import TransformationDashboardPage from './pages/TransformationDashboardPage';
import ProcessMapListPage from './pages/ProcessMapListPage';
import ProcessMapDetailPage from './pages/ProcessMapDetailPage';
import CujMapperPage from './pages/CujMapperPage';
import ValueEngineeringPage from './pages/ValueEngineeringPage';
import AreaListPage from './pages/AreaListPage';
import AreaDetailPage from './pages/AreaDetailPage';
import AreaMiniAssessmentPage from './pages/AreaMiniAssessmentPage';
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
          {/* M09 — Módulo de sesiones */}
          <Route path="/org/:orgId" element={<OrganizationPage />} />
          <Route path="/org/:orgId/sessions" element={<SessionListPage />} />
          <Route path="/org/:orgId/sessions/:sessionId" element={<SessionViewPage />} />
          <Route path="/org/:orgId/sessions/:sessionId/review" element={<TranscriptReviewPage />} />
          <Route path="/org/:orgId/maturity" element={<MaturityMapPage />} />
          {/* M10 — Diagnóstico y comité */}
          <Route path="/org/:orgId/diagnostic" element={<DiagnosticReportPage />} />
          <Route path="/org/:orgId/committee/design" element={<CommitteeDesignPage />} />
          <Route path="/org/:orgId/committee/constitution" element={<CommitteeConstitutionPage />} />
          <Route path="/org/:orgId/pilots" element={<PilotListPage />} />
          <Route path="/org/:orgId/pilots/:pilotId" element={<PilotDetailPage />} />
          {/* F-014a — Dashboard de Escalamiento */}
          <Route path="/org/:orgId/scaling" element={<ScalingDashboardPage />} />
          <Route path="/org/:orgId/scaling/:planId" element={<ScalingPlanDetailPage />} />
          {/* F-014b — Mapeo de procesos */}
          <Route path="/org/:orgId/processes" element={<ProcessMapListPage />} />
          <Route path="/org/:orgId/processes/:processId" element={<ProcessMapDetailPage />} />
          {/* F-014c — Dashboard de Transformación */}
          <Route path="/org/:orgId/transformation" element={<TransformationDashboardPage />} />
          {/* CUJ Mapper */}
          <Route path="/org/:orgId/cujs/new" element={<CujMapperPage />} />
          <Route path="/org/:orgId/cujs/:cujId" element={<CujMapperPage />} />
          {/* Value Engineering */}
          <Route path="/org/:orgId/value-engineering" element={<ValueEngineeringPage />} />
          {/* Áreas departamentales */}
          <Route path="/org/:orgId/areas" element={<AreaListPage />} />
          <Route path="/org/:orgId/areas/:areaId" element={<AreaDetailPage />} />
          <Route path="/org/:orgId/areas/:areaId/mini-assessment" element={<AreaMiniAssessmentPage />} />
          {/* F-012 — Report Builder */}
          <Route path="/org/:orgId/reports" element={<ReportBuilderPage />} />
        </Route>
      </Route>
      {/* F-013 — Council Dashboard (acceso restringido a rol council) */}
      <Route element={<ProtectedRoute allowedRoles={['council']} />}>
        <Route element={<Layout />}>
          <Route path="/council" element={<CouncilDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
