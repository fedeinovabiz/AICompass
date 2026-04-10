// ══════════════════════════════════════════════
// DIAGNOSTIC REPORT PAGE — Reporte de diagnóstico
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganizationStore } from '@/stores/organizationStore';
import { useAuthStore } from '@/stores/authStore';
import { apiPost } from '@/services/apiClient';
import type {
  DimensionKey,
  CrossSessionAnalysis,
  DimensionAnalysis,
  QuickWinSuggestion,
  DeepDiveRecommendation,
  ImplementationLevel,
  Citation,
} from '@/types';
import { DIMENSIONS } from '@/constants/dimensions';
import { useMaturityScore } from '@/hooks/useMaturityScore';
import SpiderChart from '@/components/SpiderChart';

// ── Helpers ──────────────────────────────────

const IMPL_LEVEL_BADGE: Record<ImplementationLevel, string> = {
  prompting: 'bg-green-100 text-green-800',
  'no-code': 'bg-yellow-100 text-yellow-800',
  custom: 'bg-red-100 text-red-800',
};

const IMPL_LEVEL_LABEL: Record<ImplementationLevel, string> = {
  prompting: 'Prompting',
  'no-code': 'No-code',
  custom: 'Custom',
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-400 text-sm font-bold">
        —
      </span>
    );
  }

  const colorClass =
    score === 1
      ? 'bg-red-900 text-red-300'
      : score === 2
        ? 'bg-yellow-900 text-yellow-300'
        : 'bg-green-900 text-green-300';

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${colorClass}`}
    >
      {score}
    </span>
  );
}

// ── Citas colapsables ─────────────────────────

function CitationsCollapsible({ citations }: { citations: Citation[] }) {
  const [open, setOpen] = useState(false);

  if (citations.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        {open ? 'Ocultar evidencia' : `Ver evidencia (${citations.length} cita${citations.length !== 1 ? 's' : ''})`}
      </button>
      {open && (
        <ul className="mt-2 space-y-2">
          {citations.map((cita, idx) => (
            <li
              key={idx}
              className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-sm"
            >
              <p className="text-slate-200 italic">"{cita.text}"</p>
              <p className="text-slate-500 text-xs mt-1">
                — {cita.speakerName}
                {cita.speakerRole ? `, ${cita.speakerRole}` : ''}
                {cita.timestamp ? ` (${cita.timestamp})` : ''}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Panel expandible por dimensión ───────────

function DimensionPanel({
  dimensionKey,
  analysis,
}: {
  dimensionKey: DimensionKey;
  analysis: DimensionAnalysis | null;
}) {
  const [open, setOpen] = useState(false);
  const dimDef = DIMENSIONS.find((d) => d.key === dimensionKey);

  if (!dimDef) return null;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-750 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <ScoreBadge score={analysis?.score ?? null} />
          <div>
            <p className="text-white font-semibold text-sm">{dimDef.name}</p>
            <p className="text-slate-400 text-xs">{dimDef.description}</p>
          </div>
        </div>
        <span className="text-slate-400 text-lg select-none">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-slate-700 pt-4">
          {analysis ? (
            <>
              {analysis.summary && (
                <p className="text-slate-300 text-sm mb-3">{analysis.summary}</p>
              )}

              {analysis.gaps.length > 0 && (
                <div className="mb-3">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
                    Brechas identificadas
                  </p>
                  <ul className="space-y-1">
                    {analysis.gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-red-400 mt-0.5">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <CitationsCollapsible citations={analysis.evidence} />
            </>
          ) : (
            <p className="text-slate-500 text-sm italic">
              Sin análisis disponible para esta dimensión.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card de Quick Win ─────────────────────────

function QuickWinCard({ qw }: { qw: QuickWinSuggestion }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-white font-semibold text-sm leading-snug">{qw.title}</h4>
        <span
          className={`shrink-0 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${IMPL_LEVEL_BADGE[qw.implementationLevel]}`}
        >
          {IMPL_LEVEL_LABEL[qw.implementationLevel]}
        </span>
      </div>

      <div className="space-y-2 text-xs text-slate-400 mb-3">
        <div>
          <span className="font-semibold text-slate-300">Proceso antes:</span>{' '}
          {qw.processBefore}
        </div>
        <div>
          <span className="font-semibold text-slate-300">Proceso después:</span>{' '}
          {qw.processAfter}
        </div>
        <div>
          <span className="font-semibold text-slate-300">Herramienta:</span>{' '}
          {qw.suggestedTool}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
          {qw.valueChainSegment}
        </span>
        {qw.diminishingReturns && (
          <span className="inline-block px-2 py-0.5 bg-slate-700 text-slate-400 text-xs rounded-full italic">
            {qw.diminishingReturns}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Card de Deep Dive ─────────────────────────

function DeepDiveCard({ dd }: { dd: DeepDiveRecommendation }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <p className="text-xs text-blue-400 font-medium uppercase tracking-wide mb-1">
        {dd.trigger}
      </p>
      <h4 className="text-white font-semibold text-sm mb-2">{dd.title}</h4>
      <p className="text-slate-300 text-sm mb-3">{dd.justification}</p>

      {dd.suggestedQuestions.length > 0 && (
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">
            Preguntas sugeridas
          </p>
          <ul className="space-y-1">
            {dd.suggestedQuestions.map((q, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">?</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Página principal ──────────────────────────

export default function DiagnosticReportPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const { currentOrganization, isLoading, error, fetchOrganization } = useOrganizationStore();
  const { user } = useAuthStore();

  const [analysis, setAnalysis] = useState<CrossSessionAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const isFacilitator = user?.role === 'facilitator' || user?.role === 'admin';
  const isCouncil = user?.role === 'council';

  const maturityScores = currentOrganization?.maturityScores ?? {};
  const { promedio, dimensionesEnRojo, dimensionesFuertes } = useMaturityScore(maturityScores);

  useEffect(() => {
    if (orgId) {
      void fetchOrganization(orgId);
    }
  }, [orgId, fetchOrganization]);

  async function handleGenerarAnalisis() {
    if (!orgId) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    try {
      const result = await apiPost<CrossSessionAnalysis>('/api/ai/cross-analysis', {
        organizationId: orgId,
        sessionIds: [],
      });
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Error al generar el análisis');
    } finally {
      setAnalysisLoading(false);
    }
  }

  function handlePublicar() {
    setPublished(true);
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-slate-400 text-sm">Cargando organización...</p>
      </div>
    );
  }

  if (error || !currentOrganization) {
    return (
      <div className="p-8">
        <p className="text-red-400 text-sm">{error ?? 'Organización no encontrada'}</p>
      </div>
    );
  }

  if (isCouncil && !published) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-400">El diagnóstico aún no ha sido publicado para el comité.</p>
      </div>
    );
  }

  const DIMENSION_KEYS: DimensionKey[] = [
    'estrategia',
    'procesos',
    'datos',
    'tecnologia',
    'cultura',
    'gobernanza',
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">

      {/* Encabezado */}
      <div>
        <h1 className="text-white text-2xl font-bold mb-1">
          Diagnóstico de Madurez en IA
        </h1>
        <p className="text-slate-400 text-sm">{currentOrganization.name}</p>
      </div>

      {/* Resumen de scores */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Promedio general</p>
          <p className="text-white text-3xl font-bold">
            {promedio !== null ? promedio.toFixed(1) : '—'}
          </p>
          <p className="text-slate-500 text-xs">/ 4.0</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">En rojo (nivel 1)</p>
          <p className="text-red-400 text-3xl font-bold">{dimensionesEnRojo.length}</p>
          <p className="text-slate-500 text-xs">
            {dimensionesEnRojo.length === 0 ? 'Ninguna' : dimensionesEnRojo.join(', ')}
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Dimensiones fuertes</p>
          <p className="text-green-400 text-3xl font-bold">{dimensionesFuertes.length}</p>
          <p className="text-slate-500 text-xs">
            {dimensionesFuertes.length === 0 ? 'Ninguna' : dimensionesFuertes.join(', ')}
          </p>
        </div>
      </div>

      {/* Spider Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-white font-semibold text-base mb-4">Mapa de Madurez</h2>
        <SpiderChart scores={maturityScores} />
      </div>

      {/* Paneles por dimensión */}
      <div>
        <h2 className="text-white font-semibold text-base mb-4">Análisis por Dimensión</h2>
        <div className="space-y-3">
          {DIMENSION_KEYS.map((key) => (
            <DimensionPanel
              key={key}
              dimensionKey={key}
              analysis={analysis?.dimensionScores[key] ?? null}
            />
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      {analysis && analysis.quickWinSuggestions.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-base mb-4">Quick Wins Sugeridos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.quickWinSuggestions.map((qw, idx) => (
              <QuickWinCard key={idx} qw={qw} />
            ))}
          </div>
        </div>
      )}

      {/* Deep Dives */}
      {analysis && analysis.deepDiveRecommendations.length > 0 && (
        <div>
          <h2 className="text-white font-semibold text-base mb-4">Deep Dives Recomendados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.deepDiveRecommendations.map((dd, idx) => (
              <DeepDiveCard key={idx} dd={dd} />
            ))}
          </div>
        </div>
      )}

      {/* Acciones del facilitador */}
      {isFacilitator && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={() => void handleGenerarAnalisis()}
            disabled={analysisLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {analysisLoading ? 'Generando análisis...' : 'Generar análisis cross-sesión'}
          </button>

          {!published && (
            <button
              onClick={handlePublicar}
              className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Publicar para el Comité
            </button>
          )}

          {published && (
            <span className="inline-flex items-center px-4 py-2.5 bg-slate-700 text-green-400 text-sm rounded-lg">
              ¡Publicado para el comité!
            </span>
          )}

          {analysisError && (
            <p className="w-full text-red-400 text-sm">{analysisError}</p>
          )}
        </div>
      )}
    </div>
  );
}
