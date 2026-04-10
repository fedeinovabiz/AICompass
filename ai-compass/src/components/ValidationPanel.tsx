// ══════════════════════════════════════════════
// ValidationPanel — Panel de validación de preguntas IA
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { SessionQuestion, ValidationStatus } from '@/types';
import QuestionCard from '@/components/QuestionCard';

type FilterType = 'todas' | 'pendientes' | 'aprobadas' | 'sin-cobertura';

interface ValidationPanelProps {
  questions: SessionQuestion[];
  onValidate: (questionId: string, status: ValidationStatus, editedAnswer?: string) => void;
  onComplete?: () => void;
}

const FILTER_LABELS: Record<FilterType, string> = {
  todas: 'Todas',
  pendientes: 'Pendientes',
  aprobadas: 'Aprobadas',
  'sin-cobertura': 'Sin cobertura',
};

function filterQuestions(questions: SessionQuestion[], filter: FilterType): SessionQuestion[] {
  switch (filter) {
    case 'pendientes':
      return questions.filter((q) => q.validationStatus === 'pending');
    case 'aprobadas':
      return questions.filter((q) =>
        q.validationStatus === 'approved' || q.validationStatus === 'edited',
      );
    case 'sin-cobertura':
      return questions.filter((q) =>
        q.validationStatus === 'rejected' || q.validationStatus === 'not-mentioned',
      );
    default:
      return questions;
  }
}

export default function ValidationPanel({
  questions,
  onValidate,
  onComplete,
}: ValidationPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('todas');

  const validated = questions.filter((q) => q.validationStatus !== 'pending');
  const pending = questions.filter((q) => q.validationStatus === 'pending');
  const allValidated = pending.length === 0;
  const progressPercent = questions.length > 0
    ? Math.round((validated.length / questions.length) * 100)
    : 0;

  const filteredQuestions = filterQuestions(questions, activeFilter);

  return (
    <div className="space-y-4">
      {/* Encabezado y barra de progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Validación de respuestas</h2>
          <span className="text-sm text-gray-400">
            {validated.length} de {questions.length} validadas
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">{progressPercent}% completado</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(Object.keys(FILTER_LABELS) as FilterType[]).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              activeFilter === filter
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {FILTER_LABELS[filter]}
            {filter === 'pendientes' && pending.length > 0 && (
              <span className="ml-1 bg-yellow-500 text-black rounded-full px-1 text-xs">
                {pending.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de preguntas */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-4 text-center">
            No hay preguntas en esta categoría.
          </p>
        ) : (
          filteredQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onValidate={(status, editedAnswer) => onValidate(q.id, status, editedAnswer)}
              readOnly={false}
            />
          ))
        )}
      </div>

      {/* Botón completar validación */}
      {onComplete && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onComplete}
            disabled={!allValidated}
            className="w-full py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {allValidated
              ? 'Completar validación'
              : `Quedan ${pending.length} pregunta(s) pendiente(s)`}
          </button>
        </div>
      )}
    </div>
  );
}
