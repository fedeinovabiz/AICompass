// ══════════════════════════════════════════════
// SessionListPage — Lista de sesiones de una organización
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import { useOrganizationStore } from '@/stores/organizationStore';
import { apiGet } from '@/services/apiClient';
import type { Session, Engagement } from '@/types';

const SESSION_TYPE_LABELS: Record<string, string> = {
  ejecutiva: 'Ejecutiva',
  operativa: 'Operativa',
  tecnica: 'Técnica',
  constitucion: 'Constitución',
  'deep-dive': 'Deep Dive',
  presentacion: 'Presentación',
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  'in-progress': 'En progreso',
  completed: 'Completada',
  validated: 'Validada',
};

const SESSION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-600',
  'in-progress': 'bg-yellow-600',
  completed: 'bg-blue-600',
  validated: 'bg-green-600',
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  ejecutiva: 'bg-purple-700',
  operativa: 'bg-teal-700',
  tecnica: 'bg-cyan-700',
  constitucion: 'bg-amber-700',
  'deep-dive': 'bg-rose-700',
  presentacion: 'bg-indigo-700',
};

const SESSION_TYPES = [
  'ejecutiva',
  'operativa',
  'tecnica',
  'constitucion',
  'deep-dive',
  'presentacion',
] as const;

type NewSessionType = (typeof SESSION_TYPES)[number];

function sortSessionsChronologically(sessions: Session[]): Session[] {
  return [...sessions].sort((a, b) => {
    const aDate = a.scheduledDate ?? a.completedDate ?? a.id;
    const bDate = b.scheduledDate ?? b.completedDate ?? b.id;
    return bDate.localeCompare(aDate);
  });
}

export default function SessionListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { sessions, fetchSessions, createSession, isLoading, error } = useSessionStore();
  const { currentOrganization, fetchOrganization } = useOrganizationStore();
  const [showSelector, setShowSelector] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [engagementId, setEngagementId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    if (!currentOrganization || currentOrganization.id !== orgId) {
      void fetchOrganization(orgId);
    }
    // Obtener el engagement activo de la organización
    apiGet<Engagement[]>(`/engagements/organization/${orgId}`)
      .then((engagements) => {
        const active = engagements.find((e) => e.status === 'active') ?? engagements[0];
        if (active) {
          setEngagementId(active.id);
          void fetchSessions(active.id);
        }
      })
      .catch(() => { /* sin engagement aún */ });
  }, [orgId, fetchSessions, fetchOrganization, currentOrganization]);

  async function handleCreateSession(type: NewSessionType) {
    if (!engagementId) return;
    setIsCreating(true);
    try {
      await createSession({
        engagementId,
        type,
        modality: 'presencial',
        title: `Sesión ${SESSION_TYPE_LABELS[type]} — ${new Date().toLocaleDateString('es-AR')}`,
      });
      setShowSelector(false);
    } finally {
      setIsCreating(false);
    }
  }

  const sortedSessions = sortSessionsChronologically(sessions);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sesiones</h1>
          {currentOrganization && (
            <p className="text-sm text-gray-400 mt-0.5">{currentOrganization.name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowSelector((v) => !v)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors"
        >
          + Nueva sesión
        </button>
      </div>

      {/* Selector de tipo de sesión */}
      {showSelector && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-300">Seleccionar tipo de sesión</h3>
          <div className="flex flex-wrap gap-2">
            {SESSION_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => void handleCreateSession(type)}
                disabled={isCreating}
                className={`px-3 py-1.5 text-xs text-white rounded-lg transition-colors disabled:opacity-50 ${
                  SESSION_TYPE_COLORS[type] ?? 'bg-gray-600'
                } hover:brightness-110`}
              >
                {SESSION_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowSelector(false)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Lista */}
      {isLoading && sortedSessions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">Cargando sesiones...</div>
      ) : sortedSessions.length === 0 ? (
        <div className="text-gray-500 text-center py-12 italic">
          No hay sesiones registradas. Creá la primera sesión.
        </div>
      ) : (
        <ul className="space-y-3">
          {sortedSessions.map((session) => (
            <li key={session.id}>
              <Link
                to={`/org/${orgId}/sessions/${session.id}`}
                className="flex items-center justify-between p-4 bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs text-white px-2 py-0.5 rounded-full ${
                        SESSION_TYPE_COLORS[session.type] ?? 'bg-gray-600'
                      }`}
                    >
                      {SESSION_TYPE_LABELS[session.type] ?? session.type}
                    </span>
                    <span
                      className={`text-xs text-white px-2 py-0.5 rounded-full ${
                        SESSION_STATUS_COLORS[session.status] ?? 'bg-gray-600'
                      }`}
                    >
                      {SESSION_STATUS_LABELS[session.status] ?? session.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{session.title}</p>
                  <p className="text-xs text-gray-500">
                    {(session.participants ?? []).length} participante(s)
                    {session.scheduledDate && ` · ${new Date(session.scheduledDate).toLocaleDateString('es-AR')}`}
                    {(session.questions ?? []).length > 0 &&
                      ` · ${(session.questions ?? []).filter((q) => q.validationStatus !== 'pending').length}/${(session.questions ?? []).length} validadas`}
                  </p>
                </div>
                <span className="text-gray-600 text-sm">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
