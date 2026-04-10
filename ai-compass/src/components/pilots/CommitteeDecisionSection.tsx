// ══════════════════════════════════════════════
// COMMITTEE DECISION SECTION — Decisión del comité
// Visible solo en estado "evaluating"
// ══════════════════════════════════════════════

import { useState } from 'react';

interface Props {
  onConfirm: (decision: string, justification: string) => Promise<void>;
  isSaving: boolean;
}

const DECISION_OPTIONS = [
  { value: 'scale', label: 'Escalar', description: 'El piloto fue exitoso, se expande a más equipos' },
  { value: 'iterate', label: 'Iterar', description: 'Hay mejoras necesarias antes de escalar' },
  { value: 'kill', label: 'Matar', description: 'El piloto no entregó los resultados esperados' },
];

const DECISION_COLORS: Record<string, string> = {
  scale: 'border-green-600 bg-green-900/30 text-green-300',
  iterate: 'border-orange-600 bg-orange-900/30 text-orange-300',
  kill: 'border-red-600 bg-red-900/30 text-red-300',
};

const DECISION_ACTIVE_COLORS: Record<string, string> = {
  scale: 'ring-2 ring-green-500',
  iterate: 'ring-2 ring-orange-500',
  kill: 'ring-2 ring-red-500',
};

export default function CommitteeDecisionSection({ onConfirm, isSaving }: Props) {
  const [decision, setDecision] = useState('');
  const [justification, setJustification] = useState('');

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!decision) return;
    await onConfirm(decision, justification);
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6 space-y-5 border border-yellow-700/50">
      <div>
        <h2 className="text-white font-semibold text-lg">Decisión del Comité</h2>
        <p className="text-slate-400 text-sm mt-1">
          El piloto está en evaluación. El comité debe tomar una decisión formal.
        </p>
      </div>

      <form onSubmit={(e) => void handleConfirm(e)} className="space-y-5">
        <div className="space-y-3">
          {DECISION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDecision(opt.value)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${DECISION_COLORS[opt.value]} ${
                decision === opt.value ? DECISION_ACTIVE_COLORS[opt.value] : 'opacity-70 hover:opacity-100'
              }`}
            >
              <p className="font-semibold text-sm">{opt.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Justificación
          </label>
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            required
            placeholder="Explicar los fundamentos de la decisión, basados en métricas y observaciones del piloto..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving || !decision || !justification.trim()}
          className="w-full py-2.5 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition-colors"
        >
          {isSaving ? 'Registrando...' : 'Confirmar decisión del comité'}
        </button>
      </form>
    </section>
  );
}
