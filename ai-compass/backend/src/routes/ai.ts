import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { getOne, getMany, query } from '../db';
import { analyzeSession, extractFromTranscript, crossSessionAnalysis } from '../services/ai/aiService';
import type { SessionAnalysisInput, TranscriptExtractionInput, CrossSessionInput } from '../services/ai/types';

const router = Router();

// POST /api/ai/process-session/:sessionId
// Procesa una sesión con IA: usa transcripción si existe, o solo notas con respuestas manuales
router.post(
  '/process-session/:sessionId',
  authMiddleware,
  roleGuard('facilitator', 'admin'),
  async (req, res, next) => {
    try {
      const { sessionId } = req.params;

      const session = await getOne<{
        id: string;
        type: string;
        notes: string;
        transcript_text: string | null;
        engagement_id: string;
      }>(
        'SELECT id, type, notes, transcript_text, engagement_id FROM sessions WHERE id = $1',
        [sessionId]
      );

      if (!session) {
        res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
        return;
      }

      const participants = await getMany<{ name: string; role: string; area: string }>(
        'SELECT name, role, area FROM session_participants WHERE session_id = $1',
        [sessionId]
      );

      const questionsRaw = await getMany<{
        question_id: string;
        question_text: string;
        dimension: string;
        manual_answer: string | null;
      }>(
        'SELECT question_id, question_text, dimension, manual_answer FROM session_questions WHERE session_id = $1',
        [sessionId]
      );

      let aiResult;

      if (session.transcript_text) {
        const input: TranscriptExtractionInput = {
          sessionType: session.type,
          questions: questionsRaw.map((q) => ({
            questionId: q.question_id,
            questionText: q.question_text,
            dimension: q.dimension,
          })),
          transcriptText: session.transcript_text,
          notes: session.notes || '',
          participants,
        };
        aiResult = await extractFromTranscript(input);
      } else {
        const input: SessionAnalysisInput = {
          sessionType: session.type,
          questions: questionsRaw.map((q) => ({
            questionId: q.question_id,
            questionText: q.question_text,
            dimension: q.dimension,
            manualAnswer: q.manual_answer ?? undefined,
          })),
          notes: session.notes || '',
          participants,
        };
        aiResult = await analyzeSession(input);
      }

      // Guardar resultados en session_questions
      for (const q of aiResult.questions) {
        await query(
          `UPDATE session_questions
           SET suggested_answer = $1,
               suggested_level = $2,
               confidence = $3,
               citations = $4,
               updated_at = NOW()
           WHERE session_id = $5 AND question_id = $6`,
          [
            q.suggestedAnswer,
            q.suggestedLevel,
            q.confidence,
            JSON.stringify(q.citations),
            sessionId,
            q.questionId,
          ]
        );
      }

      // Eliminar hallazgos anteriores e insertar los nuevos
      await query('DELETE FROM emergent_findings WHERE session_id = $1', [sessionId]);

      for (const finding of aiResult.findings) {
        await query(
          `INSERT INTO emergent_findings (session_id, type, description, citations, related_dimensions)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            sessionId,
            finding.type,
            finding.description,
            JSON.stringify(finding.citations),
            JSON.stringify(finding.relatedDimensions),
          ]
        );
      }

      // Marcar la sesión como procesada
      await query(
        'UPDATE sessions SET ai_processed_at = NOW(), updated_at = NOW() WHERE id = $1',
        [sessionId]
      );

      res.json({
        message: 'Sesión procesada correctamente',
        sessionId,
        questionsUpdated: aiResult.questions.length,
        findingsCreated: aiResult.findings.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/ai/cross-analysis
// Análisis cross-sesión de una organización. Body: { organizationId }
router.post(
  '/cross-analysis',
  authMiddleware,
  roleGuard('facilitator', 'admin'),
  async (req, res, next) => {
    try {
      const { organizationId } = req.body;

      if (!organizationId) {
        res.status(400).json({ message: 'organizationId es requerido', code: 'VALIDATION_ERROR' });
        return;
      }

      const organization = await getOne<{ id: string; name: string; industry: string }>(
        'SELECT id, name, industry FROM organizations WHERE id = $1',
        [organizationId]
      );

      if (!organization) {
        res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });
        return;
      }

      // Obtener todas las sesiones completadas con sus datos
      const sessionsRaw = await getMany<{
        id: string;
        type: string;
      }>(
        `SELECT s.id, s.type
         FROM sessions s
         INNER JOIN engagements e ON s.engagement_id = e.id
         WHERE e.organization_id = $1
           AND s.status IN ('completed', 'validated')
           AND s.ai_processed_at IS NOT NULL`,
        [organizationId]
      );

      if (sessionsRaw.length === 0) {
        res.status(422).json({
          message: 'No hay sesiones procesadas con IA para esta organización',
          code: 'NO_PROCESSED_SESSIONS',
        });
        return;
      }

      // Construir input del análisis cross-sesión
      const sessionsInput: CrossSessionInput['sessions'] = [];

      for (const session of sessionsRaw) {
        const questions = await getMany<{
          question_id: string;
          dimension: string;
          final_answer: string | null;
          suggested_answer: string | null;
          suggested_level: number | null;
        }>(
          `SELECT question_id, dimension, final_answer, suggested_answer, suggested_level
           FROM session_questions
           WHERE session_id = $1`,
          [session.id]
        );

        const findings = await getMany<{ type: string; description: string }>(
          'SELECT type, description FROM emergent_findings WHERE session_id = $1',
          [session.id]
        );

        sessionsInput.push({
          type: session.type,
          questions: questions.map((q) => ({
            questionId: q.question_id,
            dimension: q.dimension,
            finalAnswer: q.final_answer || q.suggested_answer || '',
            level: q.suggested_level ?? 1,
          })),
          findings,
        });
      }

      const crossInput: CrossSessionInput = {
        sessions: sessionsInput,
        organizationName: organization.name,
        industry: organization.industry,
      };

      const crossResult = await crossSessionAnalysis(crossInput);

      // Guardar análisis cross-sesión
      const insertResult = await query(
        `INSERT INTO cross_session_analyses
           (organization_id, dimension_scores, committee_recommendation, deep_dive_recommendations, quick_win_suggestions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, generated_at`,
        [
          organizationId,
          JSON.stringify(crossResult.dimensionScores),
          JSON.stringify(crossResult.committeeRecommendation),
          JSON.stringify(crossResult.deepDiveRecommendations),
          JSON.stringify(crossResult.quickWinSuggestions),
        ]
      );

      // Actualizar maturity_scores en la organización
      await query(
        'UPDATE organizations SET maturity_scores = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(crossResult.dimensionScores), organizationId]
      );

      res.json({
        message: 'Análisis cross-sesión generado correctamente',
        analysisId: insertResult.rows[0].id,
        generatedAt: insertResult.rows[0].generated_at,
        dimensionsAnalyzed: Object.keys(crossResult.dimensionScores).length,
        quickWins: crossResult.quickWinSuggestions.length,
        deepDives: crossResult.deepDiveRecommendations.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
