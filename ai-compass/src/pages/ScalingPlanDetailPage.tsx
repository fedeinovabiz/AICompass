// ══════════════════════════════════════════════
// SCALING PLAN DETAIL PAGE — Detalle de plan de escalamiento
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useScalingStore } from '@/stores/scalingStore';
import { useAuthStore } from '@/stores/authStore';
import type { ScalingStatus, TargetArea } from '@/types';

const STATUS_CONFIG: Record<ScalingStatus, { label: string; className: string }> = {
  planning: { label: 'Planificando', className: 'bg-slate-700 text-slate-300' },
  active: { label: 'Activo', className: 'bg-blue-900 text-blue-300' },
  completed: { label: 'Completado', className: 'bg-green-900 text-green-300' },
  paused: { label: 'Pausado', className: 'bg-yellow-900 text-yellow-300' },
};

const AREA_STATUS_OPTIONS: TargetArea['status'][] = [
  'planned',
  'in-progress',
  'completed',
  'paused',
];

const AREA_STATUS_LABELS: Record<TargetArea['status'], string> = {
  planned: 'Planificado',
  'in-progress': 'En curso',
  completed: 'Completado',
  paused: 'Pausado',
};

const PLAN_STATUS_OPTIONS: ScalingStatus[] = ['planning', 'active', 'paused', 'completed'];

// ──────────────────────────────────────────────
// Sección: Áreas target
// ──────────────────────────────────────────────

function TargetAreasSection({
  areas,
  isFacilitator,
  onUpdate,
  isLoading,
}: {
  areas: TargetArea[];
  isFacilitator: boolean;
  onUpdate: (areas: TargetArea[]) => Promise<void>;
  isLoading: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [localAreas, setLocalAreas] = useState<TargetArea[]>(areas);
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaTeamSize, setNewAreaTeamSize] = useState('');

  useEffect(() => {
    setLocalAreas(areas);
  }, [areas]);

  function updateArea(index: number, field: keyof TargetArea, value: string | number) {
    setLocalAreas((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)),
    );
  }

  function removeArea(index: number) {
    setLocalAreas((prev) => prev.filter((_, i) => i !== index));
  }

  function addArea() {
    if (!newAreaName.trim()) return;
    const area: TargetArea = {
      name: newAreaName.trim(),
      teamSize: parseInt(newAreaTeamSize) || 0,
      status: 'planned',
    };
    setLocalAreas((prev) => [...prev, area]);
    setNewAreaName('');
    setNewAreaTeamSize('');
  }

  async function handleSave() {
    await onUpdate(localAreas);
    setEditing(false);
  }

  function handleCancel() {
    setLocalAreas(areas);
    setEditing(false);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Áreas target</h2>
        {isFacilitator && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Editar
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="text-sm text-slate-400 hover:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isLoading}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}
      </div>

      {localAreas.length === 0 && !editing && (
        <p className="text-slate-500 text-sm">No hay áreas definidas aún.</p>
      )}

      {localAreas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-slate-700">
                <th className="pb-2 pr-4 font-medium">Área</th>
                <th className="pb-2 pr-4 font-medium">Equipo</th>
                <th className="pb-2 pr-4 font-medium">Fecha target</th>
                <th className="pb-2 font-medium">Estado</th>
                {editing && <th className="pb-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {localAreas.map((area, i) => (
                <tr key={i} className="text-slate-300">
                  <td className="py-2 pr-4">
                    {editing ? (
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => updateArea(i, 'name', e.target.value)}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      area.name
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={area.teamSize}
                        onChange={(e) => updateArea(i, 'teamSize', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      area.teamSize
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {editing ? (
                      <input
                        type="date"
                        value={area.targetDate ?? ''}
                        onChange={(e) => updateArea(i, 'targetDate', e.target.value)}
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      area.targetDate ?? '—'
                    )}
                  </td>
                  <td className="py-2">
                    {editing ? (
                      <select
                        value={area.status}
                        onChange={(e) =>
                          updateArea(i, 'status', e.target.value as TargetArea['status'])
                        }
                        className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        {AREA_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {AREA_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">{AREA_STATUS_LABELS[area.status]}</span>
                    )}
                  </td>
                  {editing && (
                    <td className="py-2 pl-2">
                      <button
                        type="button"
                        onClick={() => removeArea(i)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="mt-4 flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Nueva área</label>
            <input
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="Nombre del área"
              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Equipo</label>
            <input
              type="number"
              min={0}
              value={newAreaTeamSize}
              onChange={(e) => setNewAreaTeamSize(e.target.value)}
              placeholder="0"
              className="w-20 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={addArea}
            className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded transition-colors"
          >
            Agregar
          </button>
        </div>
      )}
    </section>
  );
}

// ──────────────────────────────────────────────
// Sección: Métricas por área
// ──────────────────────────────────────────────

interface AddMetricForm {
  areaName: string;
  date: string;
  adoptionPercentage: string;
  usersActive: string;
  notes: string;
}

const EMPTY_METRIC_FORM: AddMetricForm = {
  areaName: '',
  date: '',
  adoptionPercentage: '',
  usersActive: '',
  notes: '',
};

function MetricsSection({
  metrics,
  areas,
  isFacilitator,
  onAddMetric,
  isLoading,
}: {
  metrics: import('@/types').ScalingMetric[];
  areas: TargetArea[];
  isFacilitator: boolean;
  onAddMetric: (data: AddMetricForm) => Promise<void>;
  isLoading: boolean;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddMetricForm>({ ...EMPTY_METRIC_FORM });

  function update(field: keyof AddMetricForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onAddMetric(form);
    setForm({ ...EMPTY_METRIC_FORM });
    setShowForm(false);
  }

  // Construir datos para el gráfico
  const areaNames = [...new Set(metrics.map((m) => m.areaName))];
  const dates = [...new Set(metrics.map((m) => m.date))].sort();

  const chartData = dates.map((date) => {
    const point: Record<string, string | number> = { date };
    for (const area of areaNames) {
      const metric = metrics.find((m) => m.date === date && m.areaName === area);
      if (metric?.adoptionPercentage !== null && metric?.adoptionPercentage !== undefined) {
        point[area] = metric.adoptionPercentage;
      }
    }
    return point;
  });

  const COLORS = ['#60a5fa', '#34d399', '#f59e0b', '#f87171', '#a78bfa', '#fb923c'];

  return (
    <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Métricas por área</h2>
        {isFacilitator && (
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showForm ? 'Cancelar' : 'Agregar métricas'}
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-slate-700/50 rounded-lg p-4 mb-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Área</label>
              {areas.length > 0 ? (
                <select
                  value={form.areaName}
                  onChange={(e) => update('areaName', e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar área...</option>
                  {areas.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form.areaName}
                  onChange={(e) => update('areaName', e.target.value)}
                  placeholder="Nombre del área"
                  required
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Adopción (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.adoptionPercentage}
                onChange={(e) => update('adoptionPercentage', e.target.value)}
                placeholder="0.0"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Usuarios activos</label>
              <input
                type="number"
                min={0}
                value={form.usersActive}
                onChange={(e) => update('usersActive', e.target.value)}
                placeholder="0"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => update('notes', e.target.value)}
              rows={2}
              disabled={isLoading}
              placeholder="Observaciones del período..."
              className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm resize-none focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded transition-colors font-medium"
          >
            {isLoading ? 'Guardando...' : 'Guardar métrica'}
          </button>
        </form>
      )}

      {metrics.length === 0 && !showForm && (
        <p className="text-slate-500 text-sm">No hay métricas registradas aún.</p>
      )}

      {chartData.length > 0 && areaNames.length > 0 && (
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#cbd5e1' }}
                formatter={(value) => [`${value ?? ''}%`, '']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              {areaNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

// ──────────────────────────────────────────────
// Sección: Estado del plan
// ──────────────────────────────────────────────

function PlanStatusSection({
  currentStatus,
  isFacilitator,
  onUpdateStatus,
  isLoading,
}: {
  currentStatus: ScalingStatus;
  isFacilitator: boolean;
  onUpdateStatus: (status: ScalingStatus) => Promise<void>;
  isLoading: boolean;
}) {
  const config = STATUS_CONFIG[currentStatus];

  if (!isFacilitator) {
    return (
      <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-white font-semibold text-lg mb-3">Estado del plan</h2>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
          {config.label}
        </span>
      </section>
    );
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h2 className="text-white font-semibold text-lg mb-4">Estado del plan</h2>
      <div className="flex flex-wrap gap-2">
        {PLAN_STATUS_OPTIONS.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const isActive = status === currentStatus;
          return (
            <button
              key={status}
              type="button"
              disabled={isActive || isLoading}
              onClick={() => void onUpdateStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                isActive
                  ? `${cfg.className} border-current opacity-100`
                  : 'border-slate-600 text-slate-400 hover:text-white hover:border-slate-400'
              } disabled:cursor-not-allowed`}
            >
              {cfg.label}
              {isActive && ' (actual)'}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Página principal
// ──────────────────────────────────────────────

export default function ScalingPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuthStore();
  const { currentPlan, isLoading, error, fetchPlan, updatePlan, addMetric, clearCurrentPlan } =
    useScalingStore();

  const isFacilitator = user?.role === 'admin' || user?.role === 'facilitator';

  useEffect(() => {
    if (planId) void fetchPlan(planId);
    return () => clearCurrentPlan();
  }, [planId, fetchPlan, clearCurrentPlan]);

  async function handleUpdateAreas(areas: TargetArea[]) {
    if (!planId) return;
    await updatePlan(planId, { targetAreas: areas });
    void fetchPlan(planId);
  }

  async function handleUpdateStatus(status: ScalingStatus) {
    if (!planId) return;
    await updatePlan(planId, { scalingStatus: status });
  }

  async function handleAddMetric(data: AddMetricForm) {
    if (!planId) return;
    await addMetric(planId, {
      areaName: data.areaName,
      date: data.date,
      adoptionPercentage: data.adoptionPercentage ? parseFloat(data.adoptionPercentage) : undefined,
      usersActive: data.usersActive ? parseInt(data.usersActive) : undefined,
      notes: data.notes || undefined,
    });
  }

  if (isLoading && !currentPlan) {
    return (
      <div className="p-8">
        <p className="text-slate-400 text-sm">Cargando plan de escalamiento...</p>
      </div>
    );
  }

  if (error && !currentPlan) {
    return (
      <div className="p-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!currentPlan) return null;

  const statusConfig = STATUS_CONFIG[currentPlan.scalingStatus];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">{currentPlan.pilotName}</h1>
          <p className="text-slate-400 text-sm mt-1">
            Herramienta: <span className="text-slate-300">{currentPlan.pilotTool}</span>
            {currentPlan.totalTargetUsers > 0 && (
              <> · <span className="text-slate-300">{currentPlan.totalTargetUsers} usuarios objetivo</span></>
            )}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-medium shrink-0 ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Áreas target */}
      <TargetAreasSection
        areas={currentPlan.targetAreas}
        isFacilitator={isFacilitator}
        onUpdate={handleUpdateAreas}
        isLoading={isLoading}
      />

      {/* Métricas */}
      <MetricsSection
        metrics={currentPlan.metrics ?? []}
        areas={currentPlan.targetAreas}
        isFacilitator={isFacilitator}
        onAddMetric={handleAddMetric}
        isLoading={isLoading}
      />

      {/* Estado */}
      {isFacilitator && (
        <PlanStatusSection
          currentStatus={currentPlan.scalingStatus}
          isFacilitator={isFacilitator}
          onUpdateStatus={handleUpdateStatus}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
