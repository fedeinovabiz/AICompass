// ══════════════════════════════════════════════
// PROCESS MAP DETAIL PAGE — Detalle y rediseño de proceso
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProcessStore } from '@/stores/processStore';
import type { ProcessStep, ProcessMap, ValueChainSegment, ImplementationLevel } from '@/types';

const VALUE_CHAIN_LABELS: Record<ValueChainSegment, string> = {
  'market-to-lead': 'Market to Lead',
  'lead-to-sale': 'Lead to Sale',
  'sale-to-delivery': 'Sale to Delivery',
  'delivery-to-success': 'Delivery to Success',
  'success-to-market': 'Success to Market',
};

const STATUS_CONFIG: Record<
  ProcessMap['status'],
  { label: string; className: string }
> = {
  mapped: { label: 'Mapeado', className: 'bg-slate-700 text-slate-300' },
  analyzed: { label: 'Analizado', className: 'bg-blue-900 text-blue-300' },
  redesigned: { label: 'Rediseñado', className: 'bg-purple-900 text-purple-300' },
  approved: { label: 'Aprobado', className: 'bg-green-900 text-green-300' },
  implementing: { label: 'Implementando', className: 'bg-yellow-900 text-yellow-300' },
};

const EMPTY_STEP: Omit<ProcessStep, 'order'> = {
  description: '',
  actor: '',
  tool: '',
  timeMinutes: 0,
  isManual: true,
  aiCandidate: false,
  aiAction: '',
};

function StepCard({ step }: { step: ProcessStep }) {
  return (
    <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700">
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
          {step.order}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium mb-1">{step.description}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {step.actor && <span>Actor: <span className="text-slate-300">{step.actor}</span></span>}
            {step.tool && <span>Herramienta: <span className="text-slate-300">{step.tool}</span></span>}
            <span>{step.timeMinutes} min</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {step.isManual && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700 text-slate-400">
                Manual
              </span>
            )}
            {step.aiCandidate && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-blue-900 text-blue-300">
                Automatizable
              </span>
            )}
            {step.aiAction && (
              <span className="px-1.5 py-0.5 rounded text-xs bg-purple-900 text-purple-300 truncate max-w-full">
                IA: {step.aiAction}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepFormProps {
  onAdd: (step: Omit<ProcessStep, 'order'>) => void;
  onCancel: () => void;
}

function StepForm({ onAdd, onCancel }: StepFormProps) {
  const [data, setData] = useState<Omit<ProcessStep, 'order'>>(EMPTY_STEP);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.description.trim()) return;
    onAdd(data);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800/80 rounded-lg p-4 border border-blue-700 space-y-3"
    >
      <div>
        <label className="block text-xs text-slate-400 mb-1" htmlFor="step-desc">
          Descripción <span className="text-red-400">*</span>
        </label>
        <input
          id="step-desc"
          type="text"
          required
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
          placeholder="Descripción del paso"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="step-actor">
            Actor
          </label>
          <input
            id="step-actor"
            type="text"
            value={data.actor}
            onChange={(e) => setData({ ...data, actor: e.target.value })}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="Ej: Analista"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="step-tool">
            Herramienta
          </label>
          <input
            id="step-tool"
            type="text"
            value={data.tool}
            onChange={(e) => setData({ ...data, tool: e.target.value })}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="Ej: Excel"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="step-time">
            Tiempo (min)
          </label>
          <input
            id="step-time"
            type="number"
            min={0}
            value={data.timeMinutes}
            onChange={(e) => setData({ ...data, timeMinutes: Number(e.target.value) })}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1.5 pt-5">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={data.isManual}
              onChange={(e) => setData({ ...data, isManual: e.target.checked })}
              className="rounded"
            />
            Manual
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={data.aiCandidate}
              onChange={(e) => setData({ ...data, aiCandidate: e.target.checked })}
              className="rounded"
            />
            Candidato IA
          </label>
        </div>
      </div>

      {data.aiCandidate && (
        <div>
          <label className="block text-xs text-slate-400 mb-1" htmlFor="step-ai">
            Acción de IA
          </label>
          <input
            id="step-ai"
            type="text"
            value={data.aiAction ?? ''}
            onChange={(e) => setData({ ...data, aiAction: e.target.value })}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="Ej: Clasificación automática con GPT-4"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors"
        >
          Agregar paso
        </button>
      </div>
    </form>
  );
}

function calcTotalMinutes(steps: ProcessStep[]): number {
  return steps.reduce((acc, s) => acc + s.timeMinutes, 0);
}

export default function ProcessMapDetailPage() {
  const { orgId, processId } = useParams<{ orgId: string; processId: string }>();
  const navigate = useNavigate();
  const { currentProcess, isLoading, error, fetchProcess, updateProcess, convertToPilot } =
    useProcessStore();

  const [showCurrentForm, setShowCurrentForm] = useState(false);
  const [showRedesignForm, setShowRedesignForm] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado local para la sección de clasificación
  const [classForm, setClassForm] = useState<{
    valueChainSegment: ValueChainSegment;
    implementationLevel: ImplementationLevel;
    estimatedHoursSavedWeekly: number;
    estimatedImpact: string;
    status: ProcessMap['status'];
  } | null>(null);

  useEffect(() => {
    if (processId) {
      void fetchProcess(processId);
    }
  }, [processId, fetchProcess]);

  useEffect(() => {
    if (currentProcess) {
      setClassForm({
        valueChainSegment: currentProcess.valueChainSegment,
        implementationLevel: currentProcess.implementationLevel,
        estimatedHoursSavedWeekly: currentProcess.estimatedHoursSavedWeekly,
        estimatedImpact: currentProcess.estimatedImpact,
        status: currentProcess.status,
      });
    }
  }, [currentProcess]);

  async function handleAddCurrentStep(step: Omit<ProcessStep, 'order'>) {
    if (!currentProcess || !processId) return;
    const newStep: ProcessStep = {
      ...step,
      order: currentProcess.currentSteps.length + 1,
    };
    await updateProcess(processId, {
      currentSteps: [...currentProcess.currentSteps, newStep],
    });
    setShowCurrentForm(false);
  }

  async function handleAddRedesignedStep(step: Omit<ProcessStep, 'order'>) {
    if (!currentProcess || !processId) return;
    const newStep: ProcessStep = {
      ...step,
      order: currentProcess.redesignedSteps.length + 1,
    };
    await updateProcess(processId, {
      redesignedSteps: [...currentProcess.redesignedSteps, newStep],
    });
    setShowRedesignForm(false);
  }

  async function handleSaveClassification() {
    if (!processId || !classForm) return;
    setIsSaving(true);
    try {
      await updateProcess(processId, {
        valueChainSegment: classForm.valueChainSegment,
        implementationLevel: classForm.implementationLevel,
        estimatedHoursSavedWeekly: classForm.estimatedHoursSavedWeekly,
        estimatedImpact: classForm.estimatedImpact,
        status: classForm.status,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConvertToPilot() {
    if (!processId || !orgId) return;
    setIsConverting(true);
    try {
      const pilot = await convertToPilot(processId);
      navigate(`/org/${orgId}/pilots/${pilot.id}`);
    } catch {
      setIsConverting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="px-4 py-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!currentProcess) return null;

  const statusConfig = STATUS_CONFIG[currentProcess.status];
  const totalBefore = calcTotalMinutes(currentProcess.currentSteps);
  const totalAfter = calcTotalMinutes(currentProcess.redesignedSteps);
  const reductionPct =
    totalBefore > 0 ? Math.round(((totalBefore - totalAfter) / totalBefore) * 100) : 0;
  const stepsEliminated = Math.max(
    0,
    currentProcess.currentSteps.length - currentProcess.redesignedSteps.length,
  );

  const canConvert =
    currentProcess.status === 'redesigned' || currentProcess.status === 'approved';

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{currentProcess.name}</h1>
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
            <span className="text-slate-400 text-sm">
              Score:{' '}
              <span className="text-blue-400 font-semibold">
                {currentProcess.priorityScore.toFixed(1)}
              </span>
            </span>
          </div>
          {currentProcess.description && (
            <p className="text-slate-400 text-sm">{currentProcess.description}</p>
          )}
        </div>

        {canConvert && (
          <button
            type="button"
            onClick={() => void handleConvertToPilot()}
            disabled={isConverting}
            className="flex-shrink-0 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isConverting ? 'Convirtiendo...' : 'Convertir en piloto'}
          </button>
        )}
      </div>

      {/* Resumen entre columnas */}
      {(totalBefore > 0 || totalAfter > 0) && (
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Tiempo actual</p>
            <p className="text-white font-semibold">{totalBefore} min</p>
          </div>
          <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
            <p className="text-xs text-slate-500 mb-1">Tiempo rediseñado</p>
            <p className="text-white font-semibold">{totalAfter} min</p>
          </div>
          {totalBefore > 0 && (
            <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Reducción</p>
              <p className="text-green-400 font-semibold">{reductionPct}%</p>
            </div>
          )}
          {stepsEliminated > 0 && (
            <div className="bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Pasos eliminados</p>
              <p className="text-yellow-400 font-semibold">{stepsEliminated}</p>
            </div>
          )}
        </div>
      )}

      {/* Columnas de pasos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {/* Proceso actual */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-base">Proceso actual</h2>
            <button
              type="button"
              onClick={() => setShowCurrentForm(true)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Agregar paso
            </button>
          </div>

          <div className="space-y-2">
            {currentProcess.currentSteps.map((step) => (
              <StepCard key={step.order} step={step} />
            ))}
            {currentProcess.currentSteps.length === 0 && !showCurrentForm && (
              <p className="text-slate-500 text-sm py-4 text-center">
                Sin pasos. Comenzá agregando el primero.
              </p>
            )}
            {showCurrentForm && (
              <StepForm
                onAdd={(s) => void handleAddCurrentStep(s)}
                onCancel={() => setShowCurrentForm(false)}
              />
            )}
          </div>
        </div>

        {/* Proceso rediseñado */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-base">Proceso rediseñado</h2>
            <button
              type="button"
              onClick={() => setShowRedesignForm(true)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              + Agregar paso
            </button>
          </div>

          <div className="space-y-2">
            {currentProcess.redesignedSteps.map((step) => (
              <StepCard key={step.order} step={step} />
            ))}
            {currentProcess.redesignedSteps.length === 0 && !showRedesignForm && (
              <p className="text-slate-500 text-sm py-4 text-center">
                Sin pasos. Rediseñá el proceso con mejoras de IA.
              </p>
            )}
            {showRedesignForm && (
              <StepForm
                onAdd={(s) => void handleAddRedesignedStep(s)}
                onCancel={() => setShowRedesignForm(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Sección de clasificación */}
      {classForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold text-base mb-4">Clasificación y métricas</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="class-segment">
                Segmento de cadena de valor
              </label>
              <select
                id="class-segment"
                value={classForm.valueChainSegment}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    valueChainSegment: e.target.value as ValueChainSegment,
                  })
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
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="class-level">
                Nivel de implementación
              </label>
              <select
                id="class-level"
                value={classForm.implementationLevel}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    implementationLevel: e.target.value as ImplementationLevel,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="prompting">Prompting</option>
                <option value="no-code">No-code</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="class-hours">
                Horas ahorradas/semana
              </label>
              <input
                id="class-hours"
                type="number"
                min={0}
                step={0.5}
                value={classForm.estimatedHoursSavedWeekly}
                onChange={(e) =>
                  setClassForm({
                    ...classForm,
                    estimatedHoursSavedWeekly: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5" htmlFor="class-status">
                Estado
              </label>
              <select
                id="class-status"
                value={classForm.status}
                onChange={(e) =>
                  setClassForm({ ...classForm, status: e.target.value as ProcessMap['status'] })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="mapped">Mapeado</option>
                <option value="analyzed">Analizado</option>
                <option value="redesigned">Rediseñado</option>
                <option value="approved">Aprobado</option>
                <option value="implementing">Implementando</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs text-slate-400 mb-1.5" htmlFor="class-impact">
              Impacto estimado
            </label>
            <textarea
              id="class-impact"
              rows={2}
              value={classForm.estimatedImpact}
              onChange={(e) => setClassForm({ ...classForm, estimatedImpact: e.target.value })}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Descripción del impacto estimado"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void handleSaveClassification()}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isSaving ? 'Guardando...' : 'Guardar clasificación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
