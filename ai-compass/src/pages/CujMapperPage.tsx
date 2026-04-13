// ══════════════════════════════════════════════
// CUJ MAPPER PAGE — Mapeo de Critical User Journeys
// ══════════════════════════════════════════════

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCujStore } from '@/stores/cujStore';
import type { CujStep } from '@/types';

type StepDraft = Omit<CujStep, 'id' | 'cujId'>;

const EMPTY_STEP: StepDraft = {
  stepOrder: 0,
  description: '',
  actor: '',
  currentTool: '',
  estimatedTimeMinutes: 0,
  painPoint: '',
  agentCandidate: false,
};

function StepRow({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: StepDraft;
  index: number;
  onChange: (index: number, step: StepDraft) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start bg-slate-800 rounded-lg p-3 border border-slate-700">
      <div className="col-span-1 text-slate-500 font-mono text-sm pt-2 text-center">
        {index + 1}
      </div>
      <div className="col-span-3">
        <input
          type="text"
          placeholder="Descripción del paso"
          value={step.description}
          onChange={(e) => onChange(index, { ...step, description: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Actor"
          value={step.actor}
          onChange={(e) => onChange(index, { ...step, actor: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2">
        <input
          type="text"
          placeholder="Herramienta actual"
          value={step.currentTool}
          onChange={(e) => onChange(index, { ...step, currentTool: e.target.value })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-1">
        <input
          type="number"
          placeholder="Min"
          value={step.estimatedTimeMinutes || ''}
          onChange={(e) => onChange(index, { ...step, estimatedTimeMinutes: parseInt(e.target.value) || 0 })}
          className="w-full bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-1 flex items-center justify-center pt-1">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={step.agentCandidate}
            onChange={(e) => onChange(index, { ...step, agentCandidate: e.target.checked })}
            className="rounded border-slate-600"
          />
          <span className="text-xs text-slate-400">Agente</span>
        </label>
      </div>
      <div className="col-span-2 flex gap-1">
        <input
          type="text"
          placeholder="Punto de dolor"
          value={step.painPoint}
          onChange={(e) => onChange(index, { ...step, painPoint: e.target.value })}
          className="flex-1 bg-slate-900 text-white border border-slate-600 rounded px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-400 hover:text-red-300 px-1"
        >
          X
        </button>
      </div>
    </div>
  );
}

export default function CujMapperPage() {
  const { orgId, cujId } = useParams<{ orgId: string; cujId?: string }>();
  const navigate = useNavigate();
  const { currentCuj, fetchCuj, createCuj, updateCuj, isLoading } = useCujStore();

  const [name, setName] = useState('');
  const [actor, setActor] = useState('');
  const [objective, setObjective] = useState('');
  const [steps, setSteps] = useState<StepDraft[]>([{ ...EMPTY_STEP, stepOrder: 1 }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cujId) void fetchCuj(cujId);
  }, [cujId, fetchCuj]);

  useEffect(() => {
    if (currentCuj && cujId) {
      setName(currentCuj.name);
      setActor(currentCuj.actor);
      setObjective(currentCuj.objective);
      setSteps(
        currentCuj.steps.map((s) => ({
          stepOrder: s.stepOrder,
          description: s.description,
          actor: s.actor,
          currentTool: s.currentTool,
          estimatedTimeMinutes: s.estimatedTimeMinutes,
          painPoint: s.painPoint,
          agentCandidate: s.agentCandidate,
        })),
      );
    }
  }, [currentCuj, cujId]);

  function handleStepChange(index: number, step: StepDraft) {
    setSteps((prev) => prev.map((s, i) => (i === index ? step : s)));
  }

  function handleRemoveStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAddStep() {
    setSteps((prev) => [...prev, { ...EMPTY_STEP, stepOrder: prev.length + 1 }]);
  }

  async function handleSave() {
    if (!orgId || !name || !actor || !objective) return;
    setSaving(true);
    try {
      const stepsWithOrder = steps.map((s, i) => ({ ...s, stepOrder: i + 1 }));
      if (cujId) {
        await updateCuj(cujId, { name, actor, objective, steps: stepsWithOrder });
      } else {
        const params = new URLSearchParams(window.location.search);
        const engagementId = params.get('engagementId') ?? '';
        await createCuj({ engagementId, name, actor, objective, steps: stepsWithOrder });
      }
      navigate(`/org/${orgId}/pilots`);
    } catch {
      // Error manejado por el store
    } finally {
      setSaving(false);
    }
  }

  const totalTime = steps.reduce((sum, s) => sum + s.estimatedTimeMinutes, 0);
  const totalSteps = steps.length;
  const agentCandidates = steps.filter((s) => s.agentCandidate).length;
  const automatizablePercent = totalSteps > 0 ? Math.round((agentCandidates / totalSteps) * 100) : 0;

  if (isLoading) {
    return <div className="p-6 text-slate-400">Cargando...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          {cujId ? 'Editar' : 'Nuevo'} Critical User Journey
        </h1>
        <button
          type="button"
          onClick={() => navigate(`/org/${orgId}/pilots`)}
          className="text-slate-400 hover:text-white text-sm"
        >
          Volver a pilotos
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Nombre del journey</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Onboarding de cliente nuevo"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Actor principal (rol)</label>
          <input
            type="text"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Ej: Ejecutivo de cuenta"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Objetivo final</label>
          <input
            type="text"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Ej: Cliente activo en menos de 48h"
            className="w-full bg-slate-800 text-white border border-slate-600 rounded-lg px-3 py-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalTime} min</div>
          <div className="text-sm text-slate-400">Tiempo total</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-white">{totalSteps}</div>
          <div className="text-sm text-slate-400">Pasos totales</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-blue-400">{agentCandidates}</div>
          <div className="text-sm text-slate-400">Candidatos a agente</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="text-2xl font-bold text-emerald-400">{automatizablePercent}%</div>
          <div className="text-sm text-slate-400">Automatizable</div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2 mb-2 px-3 text-xs text-slate-500 font-medium">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Paso</div>
        <div className="col-span-2">Actor</div>
        <div className="col-span-2">Herramienta</div>
        <div className="col-span-1">Min</div>
        <div className="col-span-1">IA</div>
        <div className="col-span-2">Dolor</div>
      </div>

      <div className="space-y-2 mb-4">
        {steps.map((step, i) => (
          <StepRow
            key={i}
            step={step}
            index={i}
            onChange={handleStepChange}
            onRemove={handleRemoveStep}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAddStep}
          className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 text-sm"
        >
          + Agregar paso
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name || !actor || !objective}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 text-sm font-medium"
        >
          {saving ? 'Guardando...' : 'Guardar Journey'}
        </button>
      </div>
    </div>
  );
}
