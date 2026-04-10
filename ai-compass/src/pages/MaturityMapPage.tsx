// ══════════════════════════════════════════════
// MaturityMapPage — Mapa de madurez de la organización
// ══════════════════════════════════════════════

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useSessionStore } from '@/stores/sessionStore';
import StageMap from '@/components/StageMap';
import type { DimensionKey } from '@/types';

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

const DIMENSIONS_ORDER: DimensionKey[] = [
  'estrategia',
  'procesos',
  'datos',
  'tecnologia',
  'cultura',
  'gobernanza',
];

function MaturityScoreBars({ scores }: { scores: Record<DimensionKey, number | null> }) {
  return (
    <div className="space-y-3">
      {DIMENSIONS_ORDER.map((dim) => {
        const score = scores[dim];
        const percent = score != null ? (score / 4) * 100 : 0;
        return (
          <div key={dim} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">{DIMENSION_LABELS[dim]}</span>
              <span className="text-gray-400">
                {score != null ? `${score}/4` : 'Sin datos'}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  score == null
                    ? 'bg-gray-600'
                    : score >= 3
                    ? 'bg-green-500'
                    : score >= 2
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function hasAnyScore(scores: Record<DimensionKey, number | null>): boolean {
  return Object.values(scores).some((v) => v != null);
}

export default function MaturityMapPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const {
    currentOrganization,
    fetchOrganization,
    isLoading,
    error,
  } = useOrganizationStore();
  const { sessions, fetchSessions } = useSessionStore();

  useEffect(() => {
    if (!orgId) return;
    if (!currentOrganization || currentOrganization.id !== orgId) {
      void fetchOrganization(orgId);
    }
    void fetchSessions(orgId);
  }, [orgId, fetchOrganization, fetchSessions, currentOrganization]);

  if (isLoading && !currentOrganization) {
    return <div className="p-8 text-gray-400 text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400 text-center">{error}</div>;
  }

  if (!currentOrganization) {
    return <div className="p-8 text-gray-400 text-center">Organización no encontrada.</div>;
  }

  const scores = currentOrganization.maturityScores;
  const showScores = hasAnyScore(scores);
  const validatedSessions = sessions.filter((s) => s.status === 'validated');

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Mapa de madurez</h1>
        <p className="text-sm text-gray-400">{currentOrganization.name}</p>
      </div>

      {/* Mapa de etapas */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Etapa actual
        </h2>
        <StageMap currentStage={currentOrganization.currentStage} />
      </section>

      {/* Spider Chart placeholder — M11 lo implementará */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Radar de dimensiones
        </h2>

        {showScores ? (
          <>
            <div className="bg-gray-800 rounded-lg p-8 flex items-center justify-center border-2 border-dashed border-gray-600">
              <div className="text-center space-y-2">
                <p className="text-gray-400 font-medium">Spider Chart pendiente M11</p>
                <p className="text-xs text-gray-600">
                  El componente gráfico se implementará en el módulo M11.
                </p>
              </div>
            </div>
            <MaturityScoreBars scores={scores} />
          </>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center space-y-2">
            <p className="text-gray-500 text-sm">
              Sin scores de madurez calculados aún.
            </p>
            <p className="text-xs text-gray-600">
              Completá al menos 3 sesiones validadas y ejecutá el análisis cross-sesión.
            </p>
          </div>
        )}
      </section>

      {/* Sesiones validadas */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Sesiones validadas ({validatedSessions.length})
        </h2>
        {validatedSessions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No hay sesiones validadas. Completá el proceso de revisión en cada sesión.
          </p>
        ) : (
          <ul className="space-y-1">
            {validatedSessions.map((s) => (
              <li key={s.id} className="text-sm text-gray-300">
                {s.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Botón análisis cross-sesión */}
      <div className="pb-2">
        <button
          type="button"
          disabled={validatedSessions.length < 2}
          className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          onClick={() => {
            // M11 implementará la lógica de análisis cross-sesión
            // Por ahora es un placeholder
          }}
        >
          Generar análisis cross-sesión
        </button>
        {validatedSessions.length < 2 && (
          <p className="text-xs text-gray-500 mt-1">
            Necesitás al menos 2 sesiones validadas para generar el análisis.
          </p>
        )}
      </div>
    </div>
  );
}
