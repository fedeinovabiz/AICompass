// ══════════════════════════════════════════════
// PROCESSES — Mapeo y rediseño de procesos con IA (Etapa 4)
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// Calcula priority_score según nivel de implementación y horas ahorradas
function calcPriorityScore(
  estimatedHoursSavedWeekly: number,
  implementationLevel: string,
): number {
  const multiplier =
    implementationLevel === 'prompting' ? 3
    : implementationLevel === 'no-code' ? 2
    : 1;
  return estimatedHoursSavedWeekly * multiplier;
}

// GET /organization/:orgId — Lista process maps de la org
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const maps = await getMany(
      'SELECT * FROM process_maps WHERE organization_id = $1 ORDER BY priority_score DESC',
      [req.params.orgId],
    );
    res.json(maps);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de un process map
router.get('/:id', async (req, res, next) => {
  try {
    const map = await getOne('SELECT * FROM process_maps WHERE id = $1', [req.params.id]);
    if (!map) {
      res.status(404).json({ message: 'Proceso no encontrado', code: 'NOT_FOUND' });
      return;
    }
    res.json(map);
  } catch (err) {
    next(err);
  }
});

// POST / — Crear process map
router.post('/', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { organizationId, name, description, valueChainSegment, implementationLevel } = req.body as {
      organizationId: string;
      name: string;
      description?: string;
      valueChainSegment?: string;
      implementationLevel?: string;
    };

    if (!organizationId || !name) {
      res.status(400).json({
        message: 'Los campos organizationId y name son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const segment = valueChainSegment ?? 'delivery-to-success';
    const level = implementationLevel ?? 'prompting';

    const result = await query(
      `INSERT INTO process_maps
         (organization_id, name, description, value_chain_segment, implementation_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [organizationId, name, description ?? '', segment, level],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar process map
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const {
      currentSteps,
      redesignedSteps,
      estimatedHoursSavedWeekly,
      estimatedImpact,
      status,
      implementationLevel,
      valueChainSegment,
    } = req.body as {
      currentSteps?: unknown[];
      redesignedSteps?: unknown[];
      estimatedHoursSavedWeekly?: number;
      estimatedImpact?: string;
      status?: string;
      implementationLevel?: string;
      valueChainSegment?: string;
    };

    const existing = await getOne(
      'SELECT id, estimated_hours_saved_weekly, implementation_level FROM process_maps WHERE id = $1',
      [req.params.id],
    ) as { id: string; estimated_hours_saved_weekly: number; implementation_level: string } | null;

    if (!existing) {
      res.status(404).json({ message: 'Proceso no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const newHours = estimatedHoursSavedWeekly ?? existing.estimated_hours_saved_weekly;
    const newLevel = implementationLevel ?? existing.implementation_level;
    const newPriorityScore = calcPriorityScore(newHours, newLevel);

    const result = await query(
      `UPDATE process_maps SET
         current_steps = COALESCE($1, current_steps),
         redesigned_steps = COALESCE($2, redesigned_steps),
         estimated_hours_saved_weekly = COALESCE($3, estimated_hours_saved_weekly),
         estimated_impact = COALESCE($4, estimated_impact),
         status = COALESCE($5, status),
         implementation_level = COALESCE($6, implementation_level),
         value_chain_segment = COALESCE($7, value_chain_segment),
         priority_score = $8,
         updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        currentSteps !== undefined ? JSON.stringify(currentSteps) : null,
        redesignedSteps !== undefined ? JSON.stringify(redesignedSteps) : null,
        estimatedHoursSavedWeekly ?? null,
        estimatedImpact ?? null,
        status ?? null,
        implementationLevel ?? null,
        valueChainSegment ?? null,
        newPriorityScore,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Eliminar process map
router.delete('/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const existing = await getOne('SELECT id FROM process_maps WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Proceso no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query('DELETE FROM process_maps WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /:id/convert-to-pilot — Crear un piloto a partir de este proceso
router.post('/:id/convert-to-pilot', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const processMap = await getOne('SELECT * FROM process_maps WHERE id = $1', [req.params.id]) as {
      id: string;
      organization_id: string;
      name: string;
      current_steps: unknown[];
      redesigned_steps: unknown[];
      status: string;
    } | null;

    if (!processMap) {
      res.status(404).json({ message: 'Proceso no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const processBefore = JSON.stringify(processMap.current_steps);
    const processAfter = JSON.stringify(processMap.redesigned_steps);

    const pilotResult = await query(
      `INSERT INTO pilots
         (organization_id, title, process_before, process_after, status, tool, team_size, champion_name, champion_email)
       VALUES ($1, $2, $3, $4, 'designing', '', 0, '', '')
       RETURNING *`,
      [processMap.organization_id, processMap.name, processBefore, processAfter],
    );

    await query(
      `UPDATE process_maps SET status = 'implementing', updated_at = NOW() WHERE id = $1`,
      [req.params.id],
    );

    res.status(201).json(pilotResult.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
