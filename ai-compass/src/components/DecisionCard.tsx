// ══════════════════════════════════════════════
// DECISION CARD — Tarjeta de decisión fundacional
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { FoundationalDecision } from '@/types';
import type { DecisionTemplate } from '@/constants/foundationalDecisions';

interface DecisionCardProps {
  decision: FoundationalDecision;
  template: DecisionTemplate;
  onUpdate: (response: string) => void;
  readOnly: boolean;
}

export default function DecisionCard({
  decision,
  template,
  onUpdate,
  readOnly,
}: DecisionCardProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [localResponse, setLocalResponse] = useState(decision.response);

  const hasResponse = localResponse.trim().length > 0;

  function handleBlur() {
    if (localResponse !== decision.response) {
      onUpdate(localResponse);
    }
  }

  return (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        hasResponse
          ? 'border-emerald-600 bg-slate-800'
          : 'border-slate-600 bg-slate-800'
      }`}
    >
      {/* Cabecera: badge + título */}
      <div className="flex items-start gap-4 mb-3">
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            hasResponse
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-600 text-slate-300'
          }`}
        >
          {template.number}
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-snug">
            {template.title}
          </h3>
          <p className="text-slate-400 text-sm mt-0.5">{template.description}</p>
        </div>

        {/* Indicador de estado */}
        <span
          className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            hasResponse
              ? 'bg-emerald-900 text-emerald-300'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {hasResponse ? 'Documentada' : 'Pendiente'}
        </span>
      </div>

      {/* Guía colapsable */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setGuideOpen((prev) => !prev)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
        >
          {guideOpen ? 'Ocultar guía' : 'Ver guía'}
        </button>

        {guideOpen && (
          <div className="mt-2 px-4 py-3 bg-slate-700 rounded-lg text-sm text-slate-300 leading-relaxed border-l-2 border-blue-500">
            {template.guidance}
          </div>
        )}
      </div>

      {/* Área de respuesta */}
      <textarea
        value={localResponse}
        onChange={(e) => setLocalResponse(e.target.value)}
        onBlur={handleBlur}
        disabled={readOnly}
        placeholder="Escribir la decisión acordada por el comité..."
        rows={3}
        className={`w-full px-3 py-2 rounded-lg text-sm border resize-none transition-colors ${
          readOnly
            ? 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed'
            : hasResponse
            ? 'bg-slate-700 text-white border-emerald-600 focus:outline-none focus:border-emerald-400'
            : 'bg-slate-700 text-white border-slate-600 focus:outline-none focus:border-blue-500'
        } placeholder-slate-500`}
      />
    </div>
  );
}
