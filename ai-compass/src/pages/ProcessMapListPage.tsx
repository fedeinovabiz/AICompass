// ══════════════════════════════════════════════
// PROCESS MAP LIST PAGE — Lista de mapas de procesos
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcessStore } from '@/stores/processStore';
import type { ProcessMap, ValueChainSegment, ImplementationLevel } from '@/types';

const VALUE_CHAIN_LABELS: Record<ValueChainSegment, string> = {
  'market-to-lead': 'Market to Lead',
  'lead-to-sale': 'Lead to Sale',
  'sale-to-delivery': 'Sale to Delivery',
  'delivery-to-success': 'Delivery to Success',
  'success-to-market': 'Success to Market',
};

const IMPL_LEVEL_CONFIG: Record<ImplementationLevel, { label: string; className: string }> = {
  prompting: { label: 'Prompting', className: 'bg-green-900 text-green-300' },
  'no-code': { label: 'No-code', className: 'bg-yellow-900 text-yellow-300' },
  custom: { label: 'Custom', className: 'bg-red-900 text-red-300' },
};

const STATUS_LABELS: Record<ProcessMap['status'], string> = {
  mapped: 'Mapeado',
  analyzed: 'Analizado',
  redesigned: 'Rediseñado',
  approved: 'Aprobado',
  implementing: 'Implementando',
};

function ImplLevelBadge({ level }: { level: ImplementationLevel }) {
  const config = IMPL_LEVEL_CONFIG[level];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}

function ProcessCard({ process, onClick }: { process: ProcessMap; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-slate-800 rounded-xl p-5 hover:bg-slate-700 transition-colors border border-slate-700 hover:border-slate-500"
    >
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="text-white font-semibold text-base leading-snug flex-1">{process.name}</h3>
        <ImplLevelBadge level={process.implementationLevel} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
          {VALUE_CHAIN_LABELS[process.valueChainSegment]}
        </span>
        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
          {STATUS_LABELS[process.status]}
        </span>
      </div>

      {process.description && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{process.description}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Horas ahorradas:{' '}
          <span className="text-slate-200 font-medium">
            {process.estimatedHoursSavedWeekly}h/sem
          </span>
        </span>
        <span className="text-slate-400">
          Score:{' '}
          <span className="text-blue-400 font-semibold">{process.priorityScore.toFixed(1)}</span>
        </span>
      </div>
    </button>
  );
}

interface NewProcessFormData {
  name: string;
  description: string;
  valueChainSegment: ValueChainSegment;
  implementationLevel: ImplementationLevel;
}

const INITIAL_FORM: NewProcessFormData = {
  name: '',
  description: '',
  valueChainSegment: 'delivery-to-success',
  implementationLevel: 'prompting',
};

export default function ProcessMapListPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const { processes, isLoading, error, fetchProcesses, createProcess } = useProcessStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NewProcessFormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (orgId) {
      void fetchProcesses(orgId);
    }
  }, [orgId, fetchProcesses]);

  function handleOpenModal() {
    setForm(INITIAL_FORM);
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId || !form.name.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await createProcess({
        organizationId: orgId,
        name: form.name.trim(),
        description: form.description.trim(),
        valueChainSegment: form.valueChainSegment,
        implementationLevel: form.implementationLevel,
      });
      setShowModal(false);
      navigate(`/org/${orgId}/processes/${created.id}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Mapeo de procesos</h1>
          <p className="text-slate-400 text-sm">
            Identificá y rediseñá procesos clave con apoyo de IA
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Mapear nuevo proceso
        </button>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && processes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-slate-400 text-lg mb-2">No hay procesos mapeados.</p>
          <p className="text-slate-500 text-sm">
            Usá los hallazgos del diagnóstico para empezar.
          </p>
        </div>
      )}

      {!isLoading && processes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {processes.map((process) => (
            <ProcessCard
              key={process.id}
              process={process}
              onClick={() => navigate(`/org/${orgId}/processes/${process.id}`)}
            />
          ))}
        </div>
      )}

      {/* Modal: nuevo proceso */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-semibold text-lg">Mapear nuevo proceso</h2>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="proc-name">
                  Nombre del proceso <span className="text-red-400">*</span>
                </label>
                <input
                  id="proc-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  placeholder="Ej: Proceso de onboarding de clientes"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="proc-desc">
                  Descripción
                </label>
                <textarea
                  id="proc-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Descripción breve del proceso"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="proc-segment">
                  Segmento de cadena de valor
                </label>
                <select
                  id="proc-segment"
                  value={form.valueChainSegment}
                  onChange={(e) =>
                    setForm({ ...form, valueChainSegment: e.target.value as ValueChainSegment })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  {(Object.entries(VALUE_CHAIN_LABELS) as [ValueChainSegment, string][]).map(
                    ([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5" htmlFor="proc-level">
                  Nivel de implementación
                </label>
                <select
                  id="proc-level"
                  value={form.implementationLevel}
                  onChange={(e) =>
                    setForm({ ...form, implementationLevel: e.target.value as ImplementationLevel })
                  }
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="prompting">Prompting</option>
                  <option value="no-code">No-code</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !form.name.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Creando...' : 'Crear proceso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
