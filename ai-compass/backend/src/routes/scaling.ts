import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Lista scaling plans de la org con datos del piloto original
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const plans = await getMany(
      `SELECT sp.*, p.name AS pilot_name, p.tool AS pilot_tool, p.committee_decision
       FROM scaling_plans sp
       JOIN pilots p ON sp.pilot_id = p.id
       WHERE sp.organization_id = $1
       ORDER BY sp.created_at DESC`,
      [req.params.orgId],
    );
    res.json(plans);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de un scaling plan con métricas
router.get('/:id', async (req, res, next) => {
  try {
    const plan = await getOne(
      `SELECT sp.*, p.name AS pilot_name, p.tool AS pilot_tool, p.committee_decision
       FROM scaling_plans sp
       JOIN pilots p ON sp.pilot_id = p.id
       WHERE sp.id = $1`,
      [req.params.id],
    );
    if (!plan) {
      res.status(404).json({ message: 'Plan de escalamiento no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const metrics = await getMany(
      'SELECT * FROM scaling_metrics WHERE scaling_plan_id = $1 ORDER BY date ASC',
      [req.params.id],
    );

    res.json({ ...(plan as object), metrics });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear scaling plan
router.post('/', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { pilotId, organizationId, targetAreas, totalTargetUsers } = req.body as {
      pilotId: string;
      organizationId: string;
      targetAreas?: unknown[];
      totalTargetUsers?: number;
    };

    if (!pilotId || !organizationId) {
      res.status(400).json({ message: 'Los campos pilotId y organizationId son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    // Validar que el piloto tiene decisión 'scale'
    const pilot = await getOne(
      `SELECT id, committee_decision FROM pilots WHERE id = $1`,
      [pilotId],
    );
    if (!pilot) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const pilotRow = pilot as { id: string; committee_decision: string | null };
    if (pilotRow.committee_decision !== 'scale') {
      res.status(422).json({
        message: 'El piloto no tiene decisión de escalar aprobada',
        code: 'PILOT_NOT_APPROVED_FOR_SCALING',
      });
      return;
    }

    const result = await query(
      `INSERT INTO scaling_plans (pilot_id, organization_id, target_areas, total_target_users)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        pilotId,
        organizationId,
        JSON.stringify(targetAreas ?? []),
        totalTargetUsers ?? 0,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar scaling plan
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { targetAreas, scalingStatus, totalTargetUsers, scalingStartDate } = req.body as {
      targetAreas?: unknown[];
      scalingStatus?: string;
      totalTargetUsers?: number;
      scalingStartDate?: string | null;
    };

    const existing = await getOne('SELECT id FROM scaling_plans WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Plan de escalamiento no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE scaling_plans SET
         target_areas = COALESCE($1, target_areas),
         scaling_status = COALESCE($2, scaling_status),
         total_target_users = COALESCE($3, total_target_users),
         scaling_start_date = COALESCE($4, scaling_start_date),
         updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        targetAreas !== undefined ? JSON.stringify(targetAreas) : null,
        scalingStatus ?? null,
        totalTargetUsers ?? null,
        scalingStartDate ?? null,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/metrics — Agregar entrada de métricas
router.post('/:id/metrics', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { areaName, date, adoptionPercentage, usersActive, impactMetrics, notes } = req.body as {
      areaName: string;
      date: string;
      adoptionPercentage?: number;
      usersActive?: number;
      impactMetrics?: Record<string, unknown>;
      notes?: string;
    };

    if (!areaName || !date) {
      res.status(400).json({ message: 'Los campos areaName y date son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const planExists = await getOne('SELECT id FROM scaling_plans WHERE id = $1', [req.params.id]);
    if (!planExists) {
      res.status(404).json({ message: 'Plan de escalamiento no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO scaling_metrics (scaling_plan_id, area_name, date, adoption_percentage, users_active, impact_metrics, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.params.id,
        areaName,
        date,
        adoptionPercentage ?? null,
        usersActive ?? null,
        JSON.stringify(impactMetrics ?? {}),
        notes ?? null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
