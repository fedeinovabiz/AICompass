// ══════════════════════════════════════════════
// QuestionCard — Tarjeta de pregunta de sesión con validación
// ══════════════════════════════════════════════

import { useState } from 'react';
import type { SessionQuestion, ValidationStatus } from '@/types';
import ConfidenceBadge from '@/components/ConfidenceBadge';

interface QuestionCardProps {
  question: SessionQuestion;
  onValidate: (status: ValidationStatus, editedAnswer?: string) => void;
  onManualAnswer?: (answer: string) => void;
  readOnly: boolean;
}

const BORDER_MAP: Record<ValidationStatus, string> = {
  pending: 'border-gray-600',
  approved: 'border-green-500',
  edited: 'border-blue-500',
  rejected: 'border-red-500',
  'not-mentioned': 'border-orange-500',
};

const DIMENSION_LABELS: Record<string, string> = {
  estrategia: 'Estrategia',
  procesos: 'Procesos',
  datos: 'Datos',
  tecnologia: 'Tecnología',
  cultura: 'Cultura',
  gobernanza: 'Gobernanza',
};

export default function QuestionCard({
  question,
  onValidate,
  onManualAnswer,
  readOnly,
}: QuestionCardProps) {
  const [citationsOpen, setCitationsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedText, setEditedText] = useState(question.editedAnswer ?? question.suggestedAnswer ?? '');
  const [manualText, setManualText] = useState(question.manualAnswer ?? '');
  const [manualMode, setManualMode] = useState(false);

  const borderClass = BORDER_MAP[question.validationStatus];

  function handleEdit() {
    setEditMode(true);
    setEditedText(question.editedAnswer ?? question.suggestedAnswer ?? '');
  }

  function handleConfirmEdit() {
    if (editedText.trim()) {
      onValidate('edited', editedText.trim());
      setEditMode(false);
    }
  }

  function handleManualSave() {
    if (manualText.trim() && onManualAnswer) {
      onManualAnswer(manualText.trim());
      setManualMode(false);
    }
  }

  const displayAnswer = question.finalAnswer ?? question.editedAnswer ?? question.suggestedAnswer;

  return (
    <div className={`border-2 rounded-lg p-4 bg-gray-900 space-y-3 transition-colors ${borderClass}`}>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-white font-medium leading-snug">{question.questionText}</p>
        <span className="shrink-0 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
          {DIMENSION_LABELS[question.dimension] ?? question.dimension}
        </span>
      </div>

      {/* Respuesta sugerida */}
      {question.suggestedAnswer && (
        <div className="bg-gray-800 rounded p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Respuesta sugerida por IA
            </span>
            {question.confidence && <ConfidenceBadge level={question.confidence} />}
            {question.suggestedLevel && (
              <span className="text-xs text-gray-400">Nivel {question.suggestedLevel}</span>
            )}
          </div>

          {editMode ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={4}
                className="w-full bg-gray-700 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleConfirmEdit}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                >
                  Confirmar edición
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-200 leading-relaxed">{displayAnswer}</p>
          )}

          {/* Citas colapsables */}
          {question.citations.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setCitationsOpen((o) => !o)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {citationsOpen ? 'Ocultar citas' : `Ver ${question.citations.length} cita(s)`}
              </button>
              {citationsOpen && (
                <ul className="mt-2 space-y-1">
                  {question.citations.map((c, i) => (
                    <li key={i} className="text-xs text-gray-400 border-l-2 border-gray-600 pl-2">
                      <span className="italic">"{c.text}"</span>
                      <span className="ml-1 text-gray-500">
                        — {c.speakerName} ({c.speakerRole})
                        {c.timestamp && ` @ ${c.timestamp}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Respuesta manual si no hay sugerida */}
      {!question.suggestedAnswer && (
        <div className="space-y-2">
          {manualMode ? (
            <div className="space-y-2">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={3}
                placeholder="Escribir respuesta manual..."
                className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleManualSave}
                  disabled={!onManualAnswer}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded transition-colors"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setManualMode(false)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              {question.manualAnswer ? (
                <p className="text-sm text-gray-300 bg-gray-800 rounded p-2">{question.manualAnswer}</p>
              ) : (
                <p className="text-xs text-gray-500 italic">Sin respuesta registrada</p>
              )}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => setManualMode(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {question.manualAnswer ? 'Editar respuesta manual' : 'Agregar respuesta manual'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Botones de validación */}
      {!readOnly && !editMode && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => onValidate('approved')}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              question.validationStatus === 'approved'
                ? 'bg-green-600 border-green-600 text-white'
                : 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white'
            }`}
          >
            Aprobar
          </button>
          <button
            type="button"
            onClick={handleEdit}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              question.validationStatus === 'edited'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onValidate('rejected')}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              question.validationStatus === 'rejected'
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-red-600 text-red-400 hover:bg-red-600 hover:text-white'
            }`}
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={() => onValidate('not-mentioned')}
            className={`px-3 py-1 text-xs rounded border transition-colors ${
              question.validationStatus === 'not-mentioned'
                ? 'bg-orange-600 border-orange-600 text-white'
                : 'border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white'
            }`}
          >
            No mencionado
          </button>
        </div>
      )}

      {/* Estado actual */}
      {question.validationStatus !== 'pending' && (
        <div className="text-xs text-gray-500">
          Estado actual:{' '}
          <span className={`font-medium ${
            question.validationStatus === 'approved' ? 'text-green-400' :
            question.validationStatus === 'edited' ? 'text-blue-400' :
            question.validationStatus === 'rejected' ? 'text-red-400' :
            'text-orange-400'
          }`}>
            {question.validationStatus === 'approved' && 'Aprobado'}
            {question.validationStatus === 'edited' && 'Editado'}
            {question.validationStatus === 'rejected' && 'Rechazado'}
            {question.validationStatus === 'not-mentioned' && 'No mencionado'}
          </span>
        </div>
      )}
    </div>
  );
}
