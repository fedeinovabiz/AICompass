// ══════════════════════════════════════════════
// BASELINE SECTION — Métricas base del piloto
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { PilotMetric } from '@/types';

interface Props {
  baseline: PilotMetric[];
  pilotStatus: string;
  onSave: (metrics: PilotMetric[]) => Promise<void>;
  isSaving: boolean;
}

const EMPTY_METRIC: PilotMetric = { name: '', unit: '', baselineValue: 0 };

export default function BaselineSection({ baseline, pilotStatus, onSave, isSaving }: Props) {
  const [metrics, setMetrics] = useState<PilotMetric[]>(baseline ?? []);

  const showRedFlag = pilotStatus === 'active' && metrics.length === 0;

  function updateMetric(idx: number, field: keyof PilotMetric, value: string | number) {
    setMetrics((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    );
  }

  function addMetric() {
    setMetrics((prev) => [...prev, { ...EMPTY_METRIC }]);
  }

  function removeMetric(idx: number) {
    setMetrics((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    await onSave(metrics);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Baseline de Métricas</h2>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {showRedFlag && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm flex items-center gap-2">
          <span className="font-bold">Alerta:</span>
          El piloto está activo sin baseline definido. Sin baseline no se puede medir el impacto.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-left border-b border-slate-700">
              <th className="pb-2 pr-4 font-medium">Métrica</th>
              <th className="pb-2 pr-4 font-medium">Unidad</th>
              <th className="pb-2 pr-4 font-medium">Valor Baseline</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {metrics.map((metric, idx) => (
              <tr key={idx}>
                <td className="py-2 pr-4">
                  <input
                    type="text"
                    value={metric.name}
                    onChange={(e) => updateMetric(idx, 'name', e.target.value)}
                    placeholder="Tiempo de procesamiento"
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="text"
                    value={metric.unit}
                    onChange={(e) => updateMetric(idx, 'unit', e.target.value)}
                    placeholder="minutos"
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="number"
                    value={metric.baselineValue}
                    onChange={(e) => updateMetric(idx, 'baselineValue', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                  />
                </td>
                <td className="py-2">
                  <button
                    type="button"
                    onClick={() => removeMetric(idx)}
                    className="text-slate-500 hover:text-red-400 transition-colors px-2"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {metrics.length === 0 && (
          <p className="text-slate-500 text-sm py-4 text-center">Sin métricas aún. Agregar al menos una.</p>
        )}
      </div>

      <button
        type="button"
        onClick={addMetric}
        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg border border-slate-600 transition-colors"
      >
        + Agregar métrica
      </button>
    </section>
  );
}
