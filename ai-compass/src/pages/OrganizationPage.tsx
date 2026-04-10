// ══════════════════════════════════════════════
// OrganizationPage — Vista general de una organización
// ══════════════════════════════════════════════

import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useStageProgress } from '@/hooks/useStageProgress';
import StageMap from '@/components/StageMap';
import StageProgress from '@/components/StageProgress';
import type { Stage } from '@/types';

const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  'in-progress': 'En progreso',
  completed: 'Completada',
  validated: 'Validada',
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  ejecutiva: 'Ejecutiva',
  operativa: 'Operativa',
  tecnica: 'Técnica',
  constitucion: 'Constitución',
  'deep-dive': 'Deep Dive',
  presentacion: 'Presentación',
};

const SESSION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-600',
  'in-progress': 'bg-yellow-600',
  completed: 'bg-blue-600',
  validated: 'bg-green-600',
};

function StageActions({ stage, orgId }: { stage: Stage; orgId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/org/${orgId}/sessions`}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
      >
        Ver sesiones
      </Link>
      {stage <= 2 && (
        <Link
          to={`/org/${orgId}/maturity`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Mapa de madurez
        </Link>
      )}
      {stage >= 2 && (
        <Link
          to={`/org/${orgId}/committee/design`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Comité
        </Link>
      )}
      {stage >= 3 && (
        <Link
          to={`/org/${orgId}/pilots`}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          Pilotos
        </Link>
      )}
    </div>
  );
}

export default function OrganizationPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { currentOrganization, fetchOrganization, isLoading, error } = useOrganizationStore();
  const { sessions, fetchSessions } = useSessionStore();

  const stage = currentOrganization?.currentStage ?? 1;
  const { criteria, fulfilled, total } = useStageProgress(orgId ?? '', stage as Stage);

  useEffect(() => {
    if (!orgId) return;
    void fetchOrganization(orgId);
  }, [orgId, fetchOrganization]);

  // Cargar sesiones una vez que tengamos la org (necesitamos engagementId)
  // Por ahora cargamos desde el endpoint de org directamente si está disponible
  useEffect(() => {
    if (!orgId) return;
    // Las sesiones se cargan por engagementId; aquí usamos un endpoint de conveniencia si existe
    void fetchSessions(orgId);
  }, [orgId, fetchSessions]);

  if (isLoading && !currentOrganization) {
    return (
      <div className="p-8 text-gray-400 text-center">Cargando organización...</div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-400 text-center">{error}</div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="p-8 text-gray-400 text-center">Organización no encontrada.</div>
    );
  }

  const recentSessions = [...sessions]
    .sort((a, b) => {
      const aDate = a.scheduledDate ?? a.completedDate ?? '';
      const bDate = b.scheduledDate ?? b.completedDate ?? '';
      return bDate.localeCompare(aDate);
    })
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">{currentOrganization.name}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-gray-400">
          <span>Industria: <span className="text-gray-200">{currentOrganization.industry}</span></span>
          <span>·</span>
          <span>Tamaño: <span className="text-gray-200">{currentOrganization.size}</span></span>
          <span>·</span>
          <span>
            Contacto: <span className="text-gray-200">{currentOrganization.contactName}</span>
          </span>
        </div>
        <div className="text-sm text-blue-400">
          Etapa actual: {stage} — Criterios cumplidos: {fulfilled}/{total}
        </div>
      </div>

      {/* Mapa de etapas */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Progreso del engagement
        </h2>
        <StageMap
          currentStage={currentOrganization.currentStage}
          onStageClick={(s) => navigate(`/org/${orgId}/maturity?stage=${s}`)}
        />
        <StageProgress stage={currentOrganization.currentStage} criteria={criteria} />
      </section>

      {/* Sesiones recientes */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Sesiones recientes
          </h2>
          <Link
            to={`/org/${orgId}/sessions`}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Ver todas
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Sin sesiones registradas.</p>
        ) : (
          <ul className="space-y-2">
            {recentSessions.map((session) => (
              <li key={session.id}>
                <Link
                  to={`/org/${orgId}/sessions/${session.id}`}
                  className="flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-white">{session.title}</p>
                    <p className="text-xs text-gray-400">
                      {SESSION_TYPE_LABELS[session.type] ?? session.type}
                      {session.scheduledDate && ` · ${session.scheduledDate}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs text-white px-2 py-0.5 rounded-full ${
                      SESSION_STATUS_COLORS[session.status] ?? 'bg-gray-600'
                    }`}
                  >
                    {SESSION_STATUS_LABELS[session.status] ?? session.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Acciones según etapa */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Acciones</h2>
        <StageActions stage={currentOrganization.currentStage} orgId={orgId ?? ''} />
      </section>
    </div>
  );
}
