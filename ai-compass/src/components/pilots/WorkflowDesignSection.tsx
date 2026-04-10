// ══════════════════════════════════════════════
// WORKFLOW DESIGN SECTION — GAP CRÍTICO 1
// Diseño del flujo antes/después del piloto
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { WorkflowDesign } from '@/types';

interface Props {
  workflowDesign?: WorkflowDesign;
  pilotStatus: string;
  onSave: (design: WorkflowDesign) => Promise<void>;
  isSaving: boolean;
}

const EMPTY_DESIGN: WorkflowDesign = {
  workflowBefore: '',
  workflowAfter: '',
  humanValidationPoints: [],
  eliminatedSteps: [],
  newSteps: [],
};

function EditableList({
  items,
  onChange,
  placeholder,
  label,
  variant,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
  label: string;
  variant: 'default' | 'strikethrough' | 'highlight';
}) {
  const [newItem, setNewItem] = useState('');

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem('');
  }

  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  }

  const itemClass =
    variant === 'strikethrough'
      ? 'line-through text-slate-500'
      : variant === 'highlight'
        ? 'text-green-400'
        : 'text-slate-300';

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              readOnly
              checked={variant === 'strikethrough'}
              className="accent-blue-500 shrink-0"
            />
            <span className={`flex-1 ${itemClass}`}>{item}</span>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-slate-600 hover:text-red-400 transition-colors text-xs"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded text-sm transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function WorkflowDesignSection({ workflowDesign, pilotStatus, onSave, isSaving }: Props) {
  const [design, setDesign] = useState<WorkflowDesign>(workflowDesign ?? EMPTY_DESIGN);

  const isIncomplete = !design.workflowBefore.trim() || !design.workflowAfter.trim();
  const showWarning = pilotStatus === 'active' && isIncomplete;

  function updateField<K extends keyof WorkflowDesign>(field: K, value: WorkflowDesign[K]) {
    setDesign((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    await onSave(design);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-lg">Diseño del Workflow</h2>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white text-sm rounded-lg transition-colors"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {showWarning && (
        <div className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-3 text-red-300 text-sm">
          El piloto está activo pero el diseño del workflow no está completo. Completar antes de activar.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-slate-300 font-medium text-sm">Workflow Antes</h3>
          <textarea
            value={design.workflowBefore}
            onChange={(e) => updateField('workflowBefore', e.target.value)}
            rows={6}
            placeholder="Describe los pasos del proceso actual..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
          />
          <EditableList
            items={design.eliminatedSteps}
            onChange={(v) => updateField('eliminatedSteps', v)}
            placeholder="Paso eliminado..."
            label="Pasos eliminados"
            variant="strikethrough"
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-slate-300 font-medium text-sm">Workflow Después</h3>
          <textarea
            value={design.workflowAfter}
            onChange={(e) => updateField('workflowAfter', e.target.value)}
            rows={6}
            placeholder="Describe los pasos del proceso con IA..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-y"
          />
          <EditableList
            items={design.newSteps}
            onChange={(v) => updateField('newSteps', v)}
            placeholder="Paso nuevo..."
            label="Pasos nuevos"
            variant="highlight"
          />
        </div>
      </div>

      <EditableList
        items={design.humanValidationPoints}
        onChange={(v) => updateField('humanValidationPoints', v)}
        placeholder="Punto donde un humano debe validar..."
        label="Puntos de validación humana"
        variant="default"
      />
    </section>
  );
}
