import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';
import { getQuestionsForSession } from '../constants/questions';

const router = Router();
router.use(authMiddleware);

// GET /engagement/:engagementId — Lista sesiones con conteo de preguntas y validadas
router.get('/engagement/:engagementId', async (req, res, next) => {
  try {
    const sessions = await getMany(
      `SELECT s.*,
         COUNT(sq.id) AS question_count,
         COUNT(sq.id) FILTER (WHERE sq.validation_status IN ('approved', 'edited')) AS validated_count
       FROM sessions s
       LEFT JOIN session_questions sq ON sq.session_id = s.id
       WHERE s.engagement_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.params.engagementId],
    );
    res.json(sessions);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de sesión con participants, questions, findings
router.get('/:id', async (req, res, next) => {
  try {
    const session = await getOne('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
    if (!session) {
      res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const [participants, questions, findings] = await Promise.all([
      getMany('SELECT * FROM session_participants WHERE session_id = $1', [req.params.id]),
      getMany('SELECT * FROM session_questions WHERE session_id = $1 ORDER BY question_id', [req.params.id]),
      getMany('SELECT * FROM emergent_findings WHERE session_id = $1 ORDER BY created_at', [req.params.id]),
    ]);

    res.json({ ...session as object, participants, questions, findings });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear sesión e insertar preguntas del catálogo
router.post('/', async (req, res, next) => {
  try {
    const { engagementId, type, modality, title, scheduledDate, notes } = req.body;
    if (!engagementId || !type || !modality || !title) {
      res.status(400).json({ message: 'Los campos engagementId, type, modality y title son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const sessionResult = await query(
      `INSERT INTO sessions (engagement_id, type, modality, title, scheduled_date, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft')
       RETURNING *`,
      [engagementId, type, modality, title, scheduledDate ?? null, notes ?? null],
    );

    const session = sessionResult.rows[0];

    // Insertar preguntas del catálogo para este tipo de sesión
    const questions = getQuestionsForSession(type);
    for (const q of questions) {
      await query(
        `INSERT INTO session_questions (session_id, question_id, dimension, question_text)
         VALUES ($1, $2, $3, $4)`,
        [session.id, q.id, q.dimension, q.text],
      );
    }

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar notas, status, completedDate
router.put('/:id', async (req, res, next) => {
  try {
    const { notes, status, completedDate, scheduledDate } = req.body;

    const existing = await getOne('SELECT id FROM sessions WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE sessions SET
         notes = COALESCE($1, notes),
         status = COALESCE($2, status),
         completed_date = COALESCE($3, completed_date),
         scheduled_date = COALESCE($4, scheduled_date),
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [notes ?? null, status ?? null, completedDate ?? null, scheduledDate ?? null, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:sessionId/questions/:questionId — Actualizar respuesta/validación de una pregunta
router.put('/:sessionId/questions/:questionId', async (req, res, next) => {
  try {
    const { validationStatus, editedAnswer, manualAnswer, finalAnswer } = req.body;
    const { sessionId, questionId } = req.params;

    const existing = await getOne(
      'SELECT id FROM session_questions WHERE session_id = $1 AND id = $2',
      [sessionId, questionId],
    );
    if (!existing) {
      res.status(404).json({ message: 'Pregunta no encontrada en la sesión', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE session_questions SET
         validation_status = COALESCE($1, validation_status),
         edited_answer = COALESCE($2, edited_answer),
         manual_answer = COALESCE($3, manual_answer),
         final_answer = COALESCE($4, final_answer),
         updated_at = NOW()
       WHERE session_id = $5 AND id = $6
       RETURNING *`,
      [validationStatus ?? null, editedAnswer ?? null, manualAnswer ?? null, finalAnswer ?? null, sessionId, questionId],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/participants — Agregar participante
router.post('/:id/participants', async (req, res, next) => {
  try {
    const { name, role, area } = req.body;
    if (!name || !role || !area) {
      res.status(400).json({ message: 'Los campos name, role y area son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const sessionExists = await getOne('SELECT id FROM sessions WHERE id = $1', [req.params.id]);
    if (!sessionExists) {
      res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO session_participants (session_id, name, role, area)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, name, role, area],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:sessionId/participants/:participantId — Eliminar participante
router.delete('/:sessionId/participants/:participantId', async (req, res, next) => {
  try {
    const { sessionId, participantId } = req.params;

    const existing = await getOne(
      'SELECT id FROM session_participants WHERE session_id = $1 AND id = $2',
      [sessionId, participantId],
    );
    if (!existing) {
      res.status(404).json({ message: 'Participante no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query('DELETE FROM session_participants WHERE session_id = $1 AND id = $2', [sessionId, participantId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
