// ══════════════════════════════════════════════
// AREA DETAIL PAGE — Detalle de área con spider chart
// ══════════════════════════════════════════════

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAreaStore } from '@/stores/areaStore';
import SpiderChart from '@/components/SpiderChart';
import AiOperatingLevelBadge from '@/components/AiOperatingLevelBadge';
import AreaAssessmentStatusIcon from '@/components/AreaAssessmentStatusIcon';
import type { AiOperatingLevel, AreaAssessmentStatus, DimensionKey } from '@/types';

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

export default function AreaDetailPage() {
  const { orgId, areaId } = useParams<{ orgId: string; areaId: string }>();
  const navigate = useNavigate();
  const { currentArea, isLoading, fetchArea, resetToInherited } = useAreaStore();

  useEffect(() => {
    if (areaId) void fetchArea(areaId);
  }, [areaId, fetchArea]);

  if (isLoading || !currentArea) {
    return <div className="text-slate-400 p-8">Cargando área...</div>;
  }

  const scores = currentArea.maturityScores ?? {};
  const isInherited = currentArea.assessmentStatus === 'inherited';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(`/org/${orgId}/areas`)} className="text-sm text-slate-400 hover:text-white mb-4 block">
        Volver a áreas
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">{currentArea.displayName}</h1>
          <div className="flex items-center gap-3">
            <AreaAssessmentStatusIcon status={currentArea.assessmentStatus as AreaAssessmentStatus} />
            <AiOperatingLevelBadge level={currentArea.aiOperatingLevel as AiOperatingLevel} size="md" />
          </div>
        </div>
        <div className="flex gap-2">
          {isInherited && (
            <button
              onClick={() => navigate(`/org/${orgId}/areas/${areaId}/mini-assessment`)}
              className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-500"
            >
              Realizar mini-assessment
            </button>
          )}
          {!isInherited && (
            <button
              onClick={async () => { await resetToInherited(currentArea.id); void fetchArea(currentArea.id); }}
              className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg hover:bg-slate-600"
            >
              Volver a heredado
            </button>
          )}
        </div>
      </div>

      {isInherited && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6 text-sm text-yellow-300">
          Los scores de esta área son heredados del baseline organizacional. Realiza un mini-assessment para obtener datos específicos del área.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            Madurez del área
            {isInherited && <span className="text-xs text-slate-400 ml-2">(heredado)</span>}
          </h2>
          <SpiderChart scores={scores as Record<string, number>} />
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Scores por dimensión</h2>
          <div className="space-y-3">
            {(Object.entries(DIMENSION_LABELS) as [DimensionKey, string][]).map(([key, label]) => {
              const score = scores[key] ?? null;
              return (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{label}</span>
                  <span className={`font-medium text-sm ${isInherited ? 'text-slate-400 italic' : 'text-white'}`}>
                    {score !== null ? `${score}/4` : '\u2014'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">Pilotos vinculados</h2>
        {!currentArea.pilots || (currentArea.pilots as unknown[]).length === 0 ? (
          <p className="text-slate-500 text-sm">No hay pilotos vinculados a esta área.</p>
        ) : (
          <div className="space-y-2">
            {(currentArea.pilots as Array<{ id: string; title: string; status: string }>).map((pilot) => (
              <button
                key={pilot.id}
                onClick={() => navigate(`/org/${orgId}/pilots/${pilot.id}`)}
                className="w-full text-left bg-slate-700 rounded-lg p-3 hover:bg-slate-600 flex items-center justify-between"
              >
                <span className="text-white text-sm">{pilot.title}</span>
                <span className="text-xs text-slate-400 capitalize">{pilot.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
