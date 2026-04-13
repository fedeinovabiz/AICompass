// ══════════════════════════════════════════════
// VALUE ENGINEERING PAGE — Matriz de priorización
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '@/services/apiClient';
import type { ValueEffort, ValueRisk, ValueTimeToValue } from '@/types';

interface PilotValueRow {
  id: string;
  title: string;
  status: string;
  tool: string;
  valuePnl: number | null;
  valuePnlType: string | null;
  valueEffort: string | null;
  valueRisk: string | null;
  valueTimeToValue: string | null;
  valueScore: number | null;
  implementationType: string | null;
  cujId: string | null;
  startDate: string | null;
  committeeDecision: string | null;
}

interface ValueMatrixResponse {
  pilots: PilotValueRow[];
  summary: {
    total: number;
    evaluated: number;
    pending: number;
    totalPnl: number;
  };
}

const EFFORT_LABELS: Record<ValueEffort, string> = {
  S: 'Pequeño (S)',
  M: 'Mediano (M)',
  L: 'Grande (L)',
  XL: 'Muy grande (XL)',
};

const RISK_LABELS: Record<ValueRisk, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const TTV_LABELS: Record<ValueTimeToValue, string> = {
  under_4w: '< 4 semanas',
  '4_to_12w': '4-12 semanas',
  over_12w: '> 12 semanas',
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-slate-500 text-sm">Sin evaluar</span>;
  }
  const color =
    score >= 70 ? 'bg-emerald-900 text-emerald-300' :
    score >= 40 ? 'bg-yellow-900 text-yellow-300' :
    'bg-red-900 text-red-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

function formatCurrency(amount: number | null): string {
  if (amount === null) return '\u2014';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function ValueEngineeringPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ValueMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    apiGet<ValueMatrixResponse>(`/value-engineering/organization/${orgId}`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  }, [orgId]);

  if (isLoading) {
    return <div className="p-6 text-slate-400">Cargando matriz de priorización...</div>;
  }

  if (!data) {
    return <div className="p-6 text-red-400">Error al cargar datos de Value Engineering.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Matriz de Value Engineering</h1>
        <button
          type="button"
          onClick={() => navigate(`/org/${orgId}/pilots`)}
          className="text-slate-400 hover:text-white text-sm"
        >
          Volver a pilotos
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{data.summary.total}</div>
          <div className="text-sm text-slate-400">Pilotos totales</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{data.summary.evaluated}</div>
          <div className="text-sm text-slate-400">Evaluados</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-yellow-400">{data.summary.pending}</div>
          <div className="text-sm text-slate-400">Sin evaluar</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{formatCurrency(data.summary.totalPnl)}</div>
          <div className="text-sm text-slate-400">Impacto P&L total</div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="text-left px-4 py-3 font-medium">Score</th>
              <th className="text-left px-4 py-3 font-medium">Piloto</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-right px-4 py-3 font-medium">Impacto P&L</th>
              <th className="text-left px-4 py-3 font-medium">Esfuerzo</th>
              <th className="text-left px-4 py-3 font-medium">Riesgo</th>
              <th className="text-left px-4 py-3 font-medium">Tiempo al valor</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {data.pilots.map((pilot) => (
              <tr
                key={pilot.id}
                className="border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer"
                onClick={() => navigate(`/org/${orgId}/pilots/${pilot.id}`)}
              >
                <td className="px-4 py-3">
                  <ScoreBadge score={pilot.valueScore} />
                </td>
                <td className="px-4 py-3 text-white font-medium">{pilot.title}</td>
                <td className="px-4 py-3 text-slate-300 capitalize">{pilot.status}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatCurrency(pilot.valuePnl)}
                  {pilot.valuePnlType && (
                    <span className="text-xs text-slate-500 ml-1">
                      ({pilot.valuePnlType === 'savings' ? 'ahorro' : 'ingreso'})
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueEffort ? EFFORT_LABELS[pilot.valueEffort as ValueEffort] ?? pilot.valueEffort : '\u2014'}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueRisk ? RISK_LABELS[pilot.valueRisk as ValueRisk] ?? pilot.valueRisk : '\u2014'}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {pilot.valueTimeToValue ? TTV_LABELS[pilot.valueTimeToValue as ValueTimeToValue] ?? pilot.valueTimeToValue : '\u2014'}
                </td>
                <td className="px-4 py-3 text-slate-300 capitalize">
                  {pilot.implementationType === 'digitalization' ? 'Digitalización' : 'Rediseño'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
