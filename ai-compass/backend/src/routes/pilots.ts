import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Lista pilotos de una organización
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const pilots = await getMany(
      'SELECT * FROM pilots WHERE organization_id = $1 ORDER BY created_at DESC',
      [req.params.orgId],
    );
    res.json(pilots);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de un piloto con métricas
router.get('/:id', async (req, res, next) => {
  try {
    const pilot = await getOne('SELECT * FROM pilots WHERE id = $1', [req.params.id]);
    if (!pilot) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const metrics = await getMany(
      'SELECT * FROM pilot_metrics WHERE pilot_id = $1 ORDER BY recorded_at DESC',
      [req.params.id],
    );

    res.json({ ...pilot as object, metrics });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear piloto
router.post('/', async (req, res, next) => {
  try {
    const { organizationId, name, description, targetProcess, startDate, endDate } = req.body;
    if (!organizationId || !name) {
      res.status(400).json({ message: 'Los campos organizationId y name son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `INSERT INTO pilots (organization_id, name, description, target_process, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'planning')
       RETURNING *`,
      [organizationId, name, description ?? null, targetProcess ?? null, startDate ?? null, endDate ?? null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar piloto
router.put('/:id', async (req, res, next) => {
  try {
    const {
      name,
      description,
      status,
      workflowDesign,
      championAssignments,
      roleImpacts,
      targetProcess,
      startDate,
      endDate,
    } = req.body;

    const existing = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE pilots SET
         name = COALESCE($1, name),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         workflow_design = COALESCE($4, workflow_design),
         champion_assignments = COALESCE($5, champion_assignments),
         role_impacts = COALESCE($6, role_impacts),
         target_process = COALESCE($7, target_process),
         start_date = COALESCE($8, start_date),
         end_date = COALESCE($9, end_date),
         updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        name ?? null,
        description ?? null,
        status ?? null,
        workflowDesign ? JSON.stringify(workflowDesign) : null,
        championAssignments ? JSON.stringify(championAssignments) : null,
        roleImpacts ? JSON.stringify(roleImpacts) : null,
        targetProcess ?? null,
        startDate ?? null,
        endDate ?? null,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/metrics — Agregar entrada de métricas (incluye adoptionMetrics)
router.post('/:id/metrics', async (req, res, next) => {
  try {
    const { metricName, value, unit, adoptionMetrics, notes } = req.body;

    const pilotExists = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!pilotExists) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO pilot_metrics (pilot_id, metric_name, value, unit, adoption_metrics, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        req.params.id,
        metricName ?? null,
        value ?? null,
        unit ?? null,
        adoptionMetrics ? JSON.stringify(adoptionMetrics) : null,
        notes ?? null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/baseline — Definir baseline
router.post('/:id/baseline', async (req, res, next) => {
  try {
    const { baseline } = req.body;
    if (!baseline) {
      res.status(400).json({ message: 'El campo baseline es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const existing = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE pilots SET baseline = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(baseline), req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/decision — Registrar decisión del comité
router.put('/:id/decision', async (req, res, next) => {
  try {
    const { committeeDecision, decisionDate, decisionNotes } = req.body;
    if (!committeeDecision) {
      res.status(400).json({ message: 'El campo committeeDecision es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const existing = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE pilots SET
         committee_decision = $1,
         decision_date = COALESCE($2, decision_date),
         decision_notes = COALESCE($3, decision_notes),
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [committeeDecision, decisionDate ?? null, decisionNotes ?? null, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
