// ══════════════════════════════════════════════
// TranscriptReviewPage — Carga de transcripción y revisión IA
// ══════════════════════════════════════════════

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSessionStore } from '@/stores/sessionStore';
import TranscriptUploader from '@/components/TranscriptUploader';
import ValidationPanel from '@/components/ValidationPanel';
import FindingsPanel from '@/components/FindingsPanel';
import type { ValidationStatus } from '@/types';

export default function TranscriptReviewPage() {
  const { orgId, sessionId } = useParams<{ orgId: string; sessionId: string }>();
  const {
    currentSession,
    fetchSession,
    uploadTranscript,
    uploadTranscriptText,
    processWithAI,
    updateQuestionAnswer,
    updateSession,
    isLoading,
    isProcessingAI,
    error,
  } = useSessionStore();

  useEffect(() => {
    if (!sessionId) return;
    void fetchSession(sessionId);
  }, [sessionId, fetchSession]);

  async function handleFileUpload(file: File) {
    if (!sessionId) return;
    await uploadTranscript(sessionId, file);
  }

  async function handleTextSubmit(text: string) {
    if (!sessionId) return;
    await uploadTranscriptText(sessionId, text);
  }

  async function handleProcessAI() {
    if (!sessionId) return;
    await processWithAI(sessionId);
  }

  async function handleValidate(
    questionId: string,
    status: ValidationStatus,
    editedAnswer?: string,
  ) {
    if (!sessionId) return;
    await updateQuestionAnswer(sessionId, questionId, {
      validationStatus: status,
      editedAnswer,
    });
  }

  async function handleCompleteValidation() {
    if (!sessionId) return;
    await updateSession(sessionId, { status: 'validated' });
  }

  if (isLoading && !currentSession) {
    return <div className="p-8 text-gray-400 text-center">Cargando sesión...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-red-400 text-center">{error}</div>
    );
  }

  if (!currentSession) {
    return <div className="p-8 text-gray-400 text-center">Sesión no encontrada.</div>;
  }

  const hasTranscript = Boolean(currentSession.transcriptText ?? currentSession.transcriptFileUrl);
  const hasAIResults = currentSession.aiProcessedAt != null;

  const questions = currentSession.questions;
  const pendingQuestions = questions.filter((q) => q.validationStatus === 'pending');
  const validatedQuestions = questions.filter((q) => q.validationStatus !== 'pending');
  const progressPercent =
    questions.length > 0
      ? Math.round((validatedQuestions.length / questions.length) * 100)
      : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div className="space-y-1">
        <Link
          to={`/org/${orgId}/sessions/${sessionId}`}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← Volver a sesión
        </Link>
        <h1 className="text-xl font-bold text-white">Revisión de transcripción</h1>
        <p className="text-sm text-gray-400">{currentSession.title}</p>
      </div>

      {/* Estado del proceso */}
      {hasAIResults && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-green-300 text-sm space-y-1">
          <p className="font-medium">Análisis IA completado</p>
          <p className="text-xs text-green-400">
            Procesado: {currentSession.aiProcessedAt} ·{' '}
            {questions.length} preguntas analizadas
          </p>
        </div>
      )}

      {/* Cargador de transcripción */}
      <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Transcripción
        </h2>
        <TranscriptUploader
          onFileUpload={(f) => void handleFileUpload(f)}
          onTextSubmit={(t) => void handleTextSubmit(t)}
          currentTranscript={currentSession.transcriptText}
          isUploading={isLoading}
        />

        {/* Botón procesar con IA */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => void handleProcessAI()}
            disabled={!hasTranscript || isProcessingAI}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isProcessingAI ? 'Procesando con IA...' : 'Procesar con IA'}
          </button>
          {!hasTranscript && (
            <p className="text-xs text-gray-500 mt-1">
              Subí una transcripción antes de procesar.
            </p>
          )}
        </div>
      </section>

      {/* Resultados de validación */}
      {hasAIResults && questions.length > 0 && (
        <>
          {/* Barra de progreso global */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-medium">
                Progreso de validación
              </span>
              <span className="text-sm text-gray-400">
                {validatedQuestions.length}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </section>

          {/* Panel de validación */}
          <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <ValidationPanel
              questions={questions}
              onValidate={(qId, status, edited) => void handleValidate(qId, status, edited)}
              onComplete={
                pendingQuestions.length === 0
                  ? () => void handleCompleteValidation()
                  : undefined
              }
            />
          </section>

          {/* Hallazgos */}
          {currentSession.findings.length > 0 && (
            <section className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <FindingsPanel findings={currentSession.findings} />
            </section>
          )}

          {/* Botón completar validación (duplicado al final para UX) */}
          <div className="pb-4">
            <button
              type="button"
              onClick={() => void handleCompleteValidation()}
              disabled={pendingQuestions.length > 0 || currentSession.status === 'validated'}
              className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
            >
              {currentSession.status === 'validated'
                ? 'Sesión validada'
                : pendingQuestions.length > 0
                ? `Completar validación (${pendingQuestions.length} pendiente(s))`
                : 'Completar validación'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
