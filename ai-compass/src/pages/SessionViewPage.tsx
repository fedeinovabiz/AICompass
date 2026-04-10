// ══════════════════════════════════════════════
// SessionViewPage — Vista y edición de una sesión
// ══════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import ParticipantManager from '@/components/ParticipantManager';
import QuestionCard from '@/components/QuestionCard';
import ValidationPanel from '@/components/ValidationPanel';
import FindingsPanel from '@/components/FindingsPanel';
import type { Participant, ValidationStatus } from '@/types';

const SESSION_TYPE_LABELS: Record<string, string> = {
  ejecutiva: 'Ejecutiva',
  operativa: 'Operativa',
  tecnica: 'Técnica',
  constitucion: 'Constitución',
  'deep-dive': 'Deep Dive',
  presentacion: 'Presentación',
};

const SESSION_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  'in-progress': 'En progreso',
  completed: 'Completada',
  validated: 'Validada',
};

const AUTOSAVE_DELAY = 1500;

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SessionViewPage() {
  const { orgId, sessionId } = useParams<{ orgId: string; sessionId: string }>();
  const {
    currentSession,
    fetchSession,
    updateSession,
    updateQuestionAnswer,
    addParticipant,
    removeParticipant,
    isLoading,
    error,
  } = useSessionStore();

  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isFirstLoad = useRef(true);

  const debouncedNotes = useDebounce(notes, AUTOSAVE_DELAY);

  useEffect(() => {
    if (!sessionId) return;
    void fetchSession(sessionId);
  }, [sessionId, fetchSession]);

  useEffect(() => {
    if (currentSession) {
      setNotes(currentSession.notes ?? '');
      isFirstLoad.current = true;
    }
  }, [currentSession?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save de notas con debounce
  useEffect(() => {
    if (!sessionId || !currentSession) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (debouncedNotes === (currentSession.notes ?? '')) return;

    setIsSaving(true);
    void updateSession(sessionId, { notes: debouncedNotes }).finally(() => {
      setIsSaving(false);
    });
  }, [debouncedNotes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddParticipant = useCallback(
    (p: Omit<Participant, 'id'>) => {
      if (!sessionId) return;
      void addParticipant(sessionId, p);
    },
    [sessionId, addParticipant],
  );

  const handleRemoveParticipant = useCallback(
    (pid: string) => {
      if (!sessionId) return;
      void removeParticipant(sessionId, pid);
    },
    [sessionId, removeParticipant],
  );

  const handleValidate = useCallback(
    (questionId: string, status: ValidationStatus, editedAnswer?: string) => {
      if (!sessionId) return;
      void updateQuestionAnswer(sessionId, questionId, {
        validationStatus: status,
        editedAnswer,
      });
    },
    [sessionId, updateQuestionAnswer],
  );

  const handleManualAnswer = useCallback(
    (questionId: string, answer: string) => {
      if (!sessionId) return;
      void updateQuestionAnswer(sessionId, questionId, { manualAnswer: answer });
    },
    [sessionId, updateQuestionAnswer],
  );

  async function handleMarkCompleted() {
    if (!sessionId) return;
    await updateSession(sessionId, { status: 'completed' });
  }

  if (isLoading && !currentSession) {
    return <div className="p-8 text-gray-400 text-center">Cargando sesión...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-400 text-center">{error}</div>;
  }

  if (!currentSession) {
    return <div className="p-8 text-gray-400 text-center">Sesión no encontrada.</div>;
  }

  const isEditMode =
    currentSession.status === 'draft' || currentSession.status === 'in-progress';
  const isReviewMode =
    currentSession.status === 'completed' || currentSession.status === 'validated';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/org/${orgId}/sessions`}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Sesiones
            </Link>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
              {SESSION_TYPE_LABELS[currentSession.type] ?? currentSession.type}
            </span>
            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
              {SESSION_STATUS_LABELS[currentSession.status]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">{currentSession.title}</h1>
          {currentSession.scheduledDate && (
            <p className="text-xs text-gray-500">Fecha: {currentSession.scheduledDate}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end shrink-0">
          <Link
            to={`/org/${orgId}/sessions/${sessionId}/review`}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            Subir transcripción
          </Link>
          {isEditMode && (
            <button
              type="button"
              onClick={() => void handleMarkCompleted()}
              disabled={isLoading}
              className="px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-40 text-white text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              Marcar como completada
            </button>
          )}
        </div>
      </div>

      {/* Modo edición: participantes + notas + preguntas básicas */}
      {isEditMode && (
        <>
          {/* Participantes */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <ParticipantManager
              participants={currentSession.participants}
              onAdd={handleAddParticipant}
              onRemove={handleRemoveParticipant}
              readOnly={false}
            />
          </section>

          {/* Notas */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">Notas de sesión</h3>
              {isSaving && (
                <span className="text-xs text-gray-500">Guardando...</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Apuntar observaciones, contexto, puntos clave de la sesión..."
              className="w-full bg-gray-800 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </section>

          {/* Preguntas en modo básico */}
          {currentSession.questions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-white">
                Preguntas ({currentSession.questions.length})
              </h2>
              {currentSession.questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  onValidate={(status, edited) => handleValidate(q.id, status, edited)}
                  onManualAnswer={(answer) => handleManualAnswer(q.id, answer)}
                  readOnly={false}
                />
              ))}
            </section>
          )}
        </>
      )}

      {/* Modo revisión: validación + hallazgos */}
      {isReviewMode && (
        <>
          {/* Participantes en modo lectura */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <ParticipantManager
              participants={currentSession.participants}
              onAdd={() => undefined}
              onRemove={() => undefined}
              readOnly
            />
          </section>

          {/* Panel de validación */}
          {currentSession.questions.length > 0 && (
            <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <ValidationPanel
                questions={currentSession.questions}
                onValidate={handleValidate}
              />
            </section>
          )}

          {/* Hallazgos */}
          {currentSession.findings.length > 0 && (
            <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <FindingsPanel findings={currentSession.findings} />
            </section>
          )}

          {currentSession.notes && (
            <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-400">Notas de sesión</h3>
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {currentSession.notes}
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
