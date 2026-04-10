// ══════════════════════════════════════════════
// SCALING DASHBOARD PAGE — Dashboard de planes de escalamiento
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScalingStore } from '@/stores/scalingStore';
import { usePilotStore } from '@/stores/pilotStore';
import { useAuthStore } from '@/stores/authStore';
import type { ScalingPlan, ScalingStatus, TargetArea, Pilot } from '@/types';

const STATUS_CONFIG: Record<ScalingStatus, { label: string; className: string }> = {
  planning: { label: 'Planificando', className: 'bg-slate-700 text-slate-300' },
  active: { label: 'Activo', className: 'bg-blue-900 text-blue-300' },
  completed: { label: 'Completado', className: 'bg-green-900 text-green-300' },
  paused: { label: 'Pausado', className: 'bg-yellow-900 text-yellow-300' },
};

function StatusBadge({ status }: { status: ScalingStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function AreaBadge({ area }: { area: TargetArea }) {
  const areaStatusClass: Record<TargetArea['status'], string> = {
    planned: 'bg-slate-700 text-slate-300',
    'in-progress': 'bg-blue-900 text-blue-300',
    completed: 'bg-green-900 text-green-300',
    paused: 'bg-yellow-900 text-yellow-300',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${areaStatusClass[area.status]}`}>
      {area.name}
    </span>
  );
}

function PlanCard({ plan, onClick }: { plan: ScalingPlan; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
    >
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="text-white font-semibold text-base leading-snug flex-1">
          {plan.pilotName}
        </h3>
        <StatusBadge status={plan.scalingStatus} />
      </div>
      <p className="text-slate-400 text-sm mb-1 truncate">
        Herramienta: <span className="text-slate-300">{plan.pilotTool}</span>
      </p>
      <p className="text-slate-400 text-sm mb-3">
        Usuarios objetivo: <span className="text-slate-300">{plan.totalTargetUsers}</span>
      </p>
      {plan.targetAreas.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {plan.targetAreas.slice(0, 3).map((area) => (
            <AreaBadge key={area.name} area={area} />
          ))}
          {plan.targetAreas.length > 3 && (
            <span className="text-slate-500 text-xs self-center">
              +{plan.targetAreas.length - 3} más
            </span>
          )}
        </div>
      )}
    </button>
  );
}

interface NewPlanForm {
  pilotId: string;
  totalTargetUsers: string;
}

const EMPTY_FORM: NewPlanForm = {
  pilotId: '',
  totalTargetUsers: '',
};

function NewPlanModal({
  scalePilots,
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  scalePilots: Pilot[];
  onClose: () => void;
  onSubmit: (data: NewPlanForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<NewPlanForm>({ ...EMPTY_FORM });

  function update(field: keyof NewPlanForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-white font-semibold text-lg">Crear plan de escalamiento</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Piloto aprobado para escalar
            </label>
            {scalePilots.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No hay pilotos aprobados con decisión de escalar disponibles.
              </p>
            ) : (
              <select
                value={form.pilotId}
                onChange={(e) => update('pilotId', e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
              >
                <option value="">Seleccionar piloto...</option>
                {scalePilots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} — {p.tool}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Total de usuarios objetivo
            </label>
            <input
              type="number"
              min={1}
              value={form.totalTargetUsers}
              onChange={(e) => update('totalTargetUsers', e.target.value)}
              placeholder="100"
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || scalePilots.length === 0}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm transition-colors font-medium"
            >
              {isLoading ? 'Creando...' : 'Crear plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ScalingDashboardPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { plans, isLoading, error, fetchPlans, createPlan } = useScalingStore();
  const { pilots, fetchPilots } = usePilotStore();
  const [showModal, setShowModal] = useState(false);

  const isFacilitator = user?.role === 'admin' || user?.role === 'facilitator';

  // Pilotos con decisión 'scale' que no tienen plan aún
  const existingPilotIds = new Set(plans.map((p) => p.pilotId));
  const scalePilots = pilots.filter(
    (p) => p.committeeDecision === 'scale' && !existingPilotIds.has(p.id),
  );

  useEffect(() => {
    if (orgId) {
      void fetchPlans(orgId);
      void fetchPilots(orgId);
    }
  }, [orgId, fetchPlans, fetchPilots]);

  async function handleCreate(data: NewPlanForm) {
    if (!orgId) return;
    const plan = await createPlan({
      pilotId: data.pilotId,
      organizationId: orgId,
      totalTargetUsers: parseInt(data.totalTargetUsers) || 0,
    });
    setShowModal(false);
    void navigate(`/org/${orgId}/scaling/${plan.id}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Escalamiento</h1>
          <p className="text-slate-400 text-sm mt-1">
            {plans.length} plan{plans.length !== 1 ? 'es' : ''} de escalamiento
          </p>
        </div>
        {isFacilitator && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Crear plan de escalamiento
          </button>
        )}
      </div>

      {isLoading && (
        <p className="text-slate-400 text-sm">Cargando planes...</p>
      )}

      {!isLoading && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-base">No hay pilotos aprobados para escalar.</p>
          {isFacilitator && (
            <p className="text-slate-500 text-sm mt-2">
              Cuando un piloto tenga decisión de "Escalar" del comité, podrá crear un plan aquí.
            </p>
          )}
        </div>
      )}

      {!isLoading && plans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onClick={() => void navigate(`/org/${orgId}/scaling/${plan.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && orgId && (
        <NewPlanModal
          scalePilots={scalePilots}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
