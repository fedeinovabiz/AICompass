// ══════════════════════════════════════════════
// StageProgress — Checklist de criterios de avance de etapa
// ══════════════════════════════════════════════

import { STAGES } from '@/constants/stages';
import type { Stage } from '@/types';

interface StageProgressProps {
  stage: Stage;
  criteria: Record<string, boolean>;
}

export default function StageProgress({ stage, criteria }: StageProgressProps) {
  const stageDef = STAGES.find((s) => s.stage === stage);
  if (!stageDef) return null;

  const advanceCriteria = stageDef.advanceCriteria;
  if (advanceCriteria.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        Esta etapa no tiene criterios de avance predefinidos.
      </div>
    );
  }

  const fulfilled = advanceCriteria.filter((c) => criteria[c.id]).length;
  const total = advanceCriteria.length;
  const percent = Math.round((fulfilled / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Criterios para avanzar — Etapa {stage}
        </h3>
        <span className="text-xs text-gray-400">
          {fulfilled}/{total}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            percent === 100 ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2">
        {advanceCriteria.map((criterion) => {
          const isChecked = criteria[criterion.id] ?? false;
          return (
            <li key={criterion.id} className="flex items-start gap-2">
              <span
                className={`mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  isChecked
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-500 border border-gray-600'
                }`}
              >
                {isChecked ? '✓' : ''}
              </span>
              <span
                className={`text-sm leading-snug ${
                  isChecked ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {criterion.description}
              </span>
            </li>
          );
        })}
      </ul>

      {percent === 100 && (
        <p className="text-sm text-green-400 font-medium">
          ¡Todos los criterios cumplidos! La organización puede avanzar a la siguiente etapa.
        </p>
      )}
    </div>
  );
}
