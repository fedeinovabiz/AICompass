// ══════════════════════════════════════════════
// PILOT LIST PAGE — Listado de pilotos de IA por organización
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePilotStore } from '@/stores/pilotStore';
import { useAuthStore } from '@/stores/authStore';
import type { Pilot, PilotStatus } from '@/types';

const MAX_ACTIVE_PILOTS = 5;

const STATUS_CONFIG: Record<PilotStatus, { label: string; className: string }> = {
  designing: { label: 'Diseñando', className: 'bg-slate-700 text-slate-300' },
  active: { label: 'Activo', className: 'bg-blue-900 text-blue-300' },
  evaluating: { label: 'Evaluando', className: 'bg-yellow-900 text-yellow-300' },
  scale: { label: 'Escalar', className: 'bg-green-900 text-green-300' },
  iterate: { label: 'Iterar', className: 'bg-orange-900 text-orange-300' },
  kill: { label: 'Terminado', className: 'bg-red-900 text-red-300' },
};

function weeksSince(dateStr?: string): string {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
  return `${weeks} sem`;
}

function StatusBadge({ status }: { status: PilotStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function PilotCard({ pilot, onClick }: { pilot: Pilot; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
    >
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="text-white font-semibold text-base leading-snug flex-1">{pilot.title}</h3>
        <StatusBadge status={pilot.status} />
      </div>
      <p className="text-slate-400 text-sm mb-1 truncate">
        Herramienta: <span className="text-slate-300">{pilot.tool}</span>
      </p>
      <p className="text-slate-400 text-sm mb-3 truncate">
        Champion: <span className="text-slate-300">{pilot.championName}</span>
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Equipo: {pilot.teamSize} personas</span>
        <span>Inicio: {weeksSince(pilot.startDate)} atrás</span>
      </div>
    </button>
  );
}

interface NewPilotForm {
  title: string;
  processBefore: string;
  processAfter: string;
  tool: string;
  teamSize: string;
  championName: string;
  championEmail: string;
}

const EMPTY_FORM: NewPilotForm = {
  title: '',
  processBefore: '',
  processAfter: '',
  tool: '',
  teamSize: '',
  championName: '',
  championEmail: '',
};

function NewPilotModal({
  onClose,
  onSubmit,
  isLoading,
  error,
}: {
  onClose: () => void;
  onSubmit: (data: NewPilotForm) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<NewPilotForm>(EMPTY_FORM);

  function update(field: keyof NewPilotForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-800">
          <h2 className="text-white font-semibold text-lg">Nuevo Piloto</h2>
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
            <label className="block text-sm font-medium text-slate-300 mb-1">Título del piloto</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Automatización de informes semanales"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Proceso actual (antes)</label>
            <textarea
              value={form.processBefore}
              onChange={(e) => update('processBefore', e.target.value)}
              rows={2}
              placeholder="Descripción del proceso sin IA..."
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Proceso propuesto (después)</label>
            <textarea
              value={form.processAfter}
              onChange={(e) => update('processAfter', e.target.value)}
              rows={2}
              placeholder="Descripción del proceso con IA..."
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Herramienta de IA</label>
            <input
              type="text"
              value={form.tool}
              onChange={(e) => update('tool', e.target.value)}
              placeholder="ChatGPT, Claude, Copilot..."
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tamaño del equipo</label>
            <input
              type="number"
              min={1}
              value={form.teamSize}
              onChange={(e) => update('teamSize', e.target.value)}
              placeholder="15"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del champion</label>
              <input
                type="text"
                value={form.championName}
                onChange={(e) => update('championName', e.target.value)}
                placeholder="Ana García"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email del champion</label>
              <input
                type="email"
                value={form.championEmail}
                onChange={(e) => update('championEmail', e.target.value)}
                placeholder="ana@empresa.com"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
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
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-sm transition-colors font-medium"
            >
              {isLoading ? 'Creando...' : 'Crear piloto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PilotListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { pilots, isLoading, error, fetchPilots, createPilot } = usePilotStore();
  const [showModal, setShowModal] = useState(false);

  const isFacilitator = user?.role === 'admin' || user?.role === 'facilitator';
  const activePilots = pilots.filter((p) => p.status === 'active');
  const showActiveAlert = activePilots.length > MAX_ACTIVE_PILOTS;

  useEffect(() => {
    if (orgId) void fetchPilots(orgId);
  }, [orgId, fetchPilots]);

  async function handleCreate(data: NewPilotForm) {
    if (!orgId) return;
    const pilot = await createPilot(orgId, {
      title: data.title,
      processBefore: data.processBefore,
      processAfter: data.processAfter,
      tool: data.tool,
      teamSize: parseInt(data.teamSize) || 1,
      championName: data.championName,
      championEmail: data.championEmail,
    });
    setShowModal(false);
    void navigate(`/org/${orgId}/pilots/${pilot.id}`);
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">Pilotos de IA</h1>
          <p className="text-slate-400 text-sm mt-1">
            {pilots.length} piloto{pilots.length !== 1 ? 's' : ''} registrado{pilots.length !== 1 ? 's' : ''}
            {activePilots.length > 0 && ` · ${activePilots.length} activo${activePilots.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {isFacilitator && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Nuevo Piloto
          </button>
        )}
      </div>

      {showActiveAlert && (
        <div className="mb-5 bg-yellow-900/40 border border-yellow-700 rounded-lg px-4 py-3 text-yellow-300 text-sm">
          <span className="font-bold">Atención:</span> Hay {activePilots.length} pilotos activos simultáneamente.
          Se recomienda no superar {MAX_ACTIVE_PILOTS} pilotos activos para mantener foco y calidad.
        </div>
      )}

      {isLoading && (
        <p className="text-slate-400 text-sm">Cargando pilotos...</p>
      )}

      {!isLoading && error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {!isLoading && !error && pilots.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400 text-base">No hay pilotos registrados aún.</p>
          {isFacilitator && (
            <p className="text-slate-500 text-sm mt-2">
              Crear el primer piloto con el botón "Nuevo Piloto".
            </p>
          )}
        </div>
      )}

      {!isLoading && pilots.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pilots.map((pilot) => (
            <PilotCard
              key={pilot.id}
              pilot={pilot}
              onClick={() => void navigate(`/org/${orgId}/pilots/${pilot.id}`)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <NewPilotModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  );
}
