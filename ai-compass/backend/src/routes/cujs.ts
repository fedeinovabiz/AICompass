// ══════════════════════════════════════════════
// CUJs — Critical User Journeys (Rutas)
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /engagement/:engagementId — Lista CUJs del engagement
router.get('/engagement/:engagementId', async (req, res, next) => {
  try {
    const cujs = await getMany<{ id: string }>(
      'SELECT * FROM cujs WHERE engagement_id = $1 ORDER BY created_at DESC',
      [req.params.engagementId],
    );

    const cujsConSteps = await Promise.all(
      cujs.map(async (cuj) => {
        const steps = await getMany(
          'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
          [cuj.id],
        );
        return { ...cuj, steps };
      }),
    );

    res.json(cujsConSteps);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de un CUJ con steps
router.get('/:id', async (req, res, next) => {
  try {
    const cuj = await getOne('SELECT * FROM cujs WHERE id = $1', [req.params.id]);
    if (!cuj) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const steps = await getMany(
      'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
      [req.params.id],
    );

    res.json({ ...(cuj as object), steps });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear CUJ con steps
router.post('/', async (req, res, next) => {
  try {
    const { engagementId, name, actor, objective, steps } = req.body;
    if (!engagementId || !name || !actor || !objective) {
      res.status(400).json({
        message: 'Los campos engagementId, name, actor y objective son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await query(
      `INSERT INTO cujs (engagement_id, name, actor, objective)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [engagementId, name, actor, objective],
    );

    const cuj = result.rows[0];

    const stepsArr = Array.isArray(steps) ? steps : [];
    const insertedSteps = [];
    for (let i = 0; i < stepsArr.length; i++) {
      const s = stepsArr[i];
      const stepResult = await query(
        `INSERT INTO cuj_steps (cuj_id, step_order, description, actor, current_tool, estimated_time_minutes, pain_point, agent_candidate)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          cuj.id, i + 1, s.description, s.actor, s.currentTool ?? '',
          s.estimatedTimeMinutes ?? 0, s.painPoint ?? '', s.agentCandidate ?? false,
        ],
      );
      insertedSteps.push(stepResult.rows[0]);
    }

    res.status(201).json({ ...cuj, steps: insertedSteps });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar CUJ (metadata + reemplazar steps)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, actor, objective, steps } = req.body;

    const existing = await getOne('SELECT id FROM cujs WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query(
      `UPDATE cujs SET
         name = COALESCE($1, name),
         actor = COALESCE($2, actor),
         objective = COALESCE($3, objective),
         updated_at = NOW()
       WHERE id = $4`,
      [name ?? null, actor ?? null, objective ?? null, req.params.id],
    );

    if (Array.isArray(steps)) {
      await query('DELETE FROM cuj_steps WHERE cuj_id = $1', [req.params.id]);
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await query(
          `INSERT INTO cuj_steps (cuj_id, step_order, description, actor, current_tool, estimated_time_minutes, pain_point, agent_candidate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.params.id, i + 1, s.description, s.actor, s.currentTool ?? '',
            s.estimatedTimeMinutes ?? 0, s.painPoint ?? '', s.agentCandidate ?? false,
          ],
        );
      }
    }

    const updated = await getOne('SELECT * FROM cujs WHERE id = $1', [req.params.id]);
    const updatedSteps = await getMany(
      'SELECT * FROM cuj_steps WHERE cuj_id = $1 ORDER BY step_order ASC',
      [req.params.id],
    );

    res.json({ ...(updated as object), steps: updatedSteps });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Eliminar CUJ
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await getOne('SELECT id FROM cujs WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'CUJ no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query('DELETE FROM cujs WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
