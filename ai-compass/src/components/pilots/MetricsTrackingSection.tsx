// ══════════════════════════════════════════════
// METRICS TRACKING SECTION — GAP CRÍTICO 3
// Seguimiento de métricas con gráficas y adopción
// ══════════════════════════════════════════════

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PilotMetric, PilotMetricEntry, AdoptionMetrics } from '@/types';

interface Props {
  baseline: PilotMetric[];
  entries: PilotMetricEntry[];
  onAddEntry: (entry: PilotMetricEntry) => Promise<void>;
  isSaving: boolean;
}

const FREQUENCY_OPTIONS: AdoptionMetrics['usageFrequency'][] = ['daily', 'weekly', 'sporadic'];
const FREQUENCY_LABELS: Record<AdoptionMetrics['usageFrequency'], string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  sporadic: 'Esporádico',
};

const CHART_COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa'];

interface EntryFormState {
  date: string;
  values: Record<string, string>;
  notes: string;
  activePercentage: string;
  usageFrequency: AdoptionMetrics['usageFrequency'];
  habitualUsers: string;
  noviceUsers: string;
  nps: string;
}

function buildChartData(
  baseline: PilotMetric[],
  entries: PilotMetricEntry[],
): Record<string, number | string>[] {
  return entries.map((entry) => {
    const row: Record<string, number | string> = { date: entry.date };
    baseline.forEach((m) => {
      row[m.name] = entry.values[m.name] ?? 0;
    });
    return row;
  });
}

function MetricChart({ metric, entries, color }: { metric: PilotMetric; entries: PilotMetricEntry[]; color: string }) {
  const data = buildChartData([metric], entries);

  return (
    <div className="bg-slate-700/40 rounded-lg p-4">
      <p className="text-slate-300 text-sm font-medium mb-3">
        {metric.name} <span className="text-slate-500">({metric.unit})</span>
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
          <ReferenceLine
            y={metric.baselineValue}
            stroke="#64748b"
            strokeDasharray="4 4"
            label={{ value: 'Baseline', fill: '#64748b', fontSize: 11, position: 'right' }}
          />
          <Line
            type="monotone"
            dataKey={metric.name}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MetricsTrackingSection({ baseline, entries, onAddEntry, isSaving }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EntryFormState>({
    date: new Date().toISOString().slice(0, 10),
    values: Object.fromEntries(baseline.map((m) => [m.name, ''])),
    notes: '',
    activePercentage: '',
    usageFrequency: 'weekly',
    habitualUsers: '',
    noviceUsers: '',
    nps: '',
  });

  function updateForm<K extends keyof EntryFormState>(field: K, value: EntryFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateValue(metricName: string, value: string) {
    setForm((prev) => ({ ...prev, values: { ...prev.values, [metricName]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const adoptionMetrics: AdoptionMetrics = {
      activePercentage: parseFloat(form.activePercentage) || 0,
      usageFrequency: form.usageFrequency,
      habitualUsers: parseInt(form.habitualUsers) || 0,
      noviceUsers: parseInt(form.noviceUsers) || 0,
      nps: form.nps ? parseFloat(form.nps) : undefined,
    };

    const entry: PilotMetricEntry = {
      date: form.date,
      values: Object.fromEntries(
        Object.entries(form.values).map(([k, v]) => [k, parseFloat(v) || 0]),
      ),
      notes: form.notes || undefined,
      adoptionMetrics,
    };

    await onAddEntry(entry);
    setShowForm(false);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Tracking de Métricas</h2>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          + Entrada semanal
        </button>
      </div>

      {baseline.length === 0 && (
        <p className="text-slate-500 text-sm">Define el baseline antes de registrar métricas.</p>
      )}

      {baseline.length > 0 && entries.length === 0 && (
        <p className="text-slate-500 text-sm">Sin entradas aún. Agregar la primera entrada semanal.</p>
      )}

      {baseline.length > 0 && entries.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {baseline.map((metric, idx) => (
            <MetricChart
              key={metric.name}
              metric={metric}
              entries={entries}
              color={CHART_COLORS[idx % CHART_COLORS.length]}
            />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
              <h3 className="text-white font-semibold">Nueva Entrada Semanal</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateForm('date', e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-300">Métricas de impacto</p>
                {baseline.map((metric) => (
                  <div key={metric.name}>
                    <label className="block text-xs text-slate-400 mb-1">
                      {metric.name} ({metric.unit}) — baseline: {metric.baselineValue}
                    </label>
                    <input
                      type="number"
                      value={form.values[metric.name] ?? ''}
                      onChange={(e) => updateValue(metric.name, e.target.value)}
                      placeholder={String(metric.baselineValue)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-300">Métricas de adopción</p>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">% Equipo activo</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.activePercentage}
                    onChange={(e) => updateForm('activePercentage', e.target.value)}
                    placeholder="75"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Frecuencia de uso</label>
                  <select
                    value={form.usageFrequency}
                    onChange={(e) => updateForm('usageFrequency', e.target.value as AdoptionMetrics['usageFrequency'])}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{FREQUENCY_LABELS[opt]}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Usuarios habituales</label>
                    <input
                      type="number"
                      min={0}
                      value={form.habitualUsers}
                      onChange={(e) => updateForm('habitualUsers', e.target.value)}
                      placeholder="10"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Usuarios novatos</label>
                    <input
                      type="number"
                      min={0}
                      value={form.noviceUsers}
                      onChange={(e) => updateForm('noviceUsers', e.target.value)}
                      placeholder="5"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">NPS (opcional, -100 a 100)</label>
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    value={form.nps}
                    onChange={(e) => updateForm('nps', e.target.value)}
                    placeholder="40"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  rows={3}
                  placeholder="Observaciones de la semana..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm transition-colors font-medium"
                >
                  {isSaving ? 'Guardando...' : 'Registrar entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
