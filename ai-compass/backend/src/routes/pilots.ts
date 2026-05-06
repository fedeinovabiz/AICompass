import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

function calcValueScore(
  pnl: number | null | undefined,
  effort: string | null | undefined,
  risk: string | null | undefined,
  ttv: string | null | undefined,
): number | null {
  if (pnl == null || !effort || !risk || !ttv) return null;

  const PNL_CAP = 500000;
  const pnlNorm = Math.min(pnl / PNL_CAP, 1) * 100;

  const effortMap: Record<string, number> = { XL: 25, L: 50, M: 75, S: 100 };
  const riskMap: Record<string, number> = { high: 33, medium: 66, low: 100 };
  const ttvMap: Record<string, number> = { over_12w: 33, '4_to_12w': 66, under_4w: 100 };

  const effortInv = effortMap[effort] ?? 50;
  const riskInv = riskMap[risk] ?? 50;
  const ttvInv = ttvMap[ttv] ?? 50;

  return Math.round(pnlNorm * 0.40 + effortInv * 0.25 + riskInv * 0.20 + ttvInv * 0.15);
}

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
      'SELECT * FROM pilot_metrics WHERE pilot_id = $1 ORDER BY created_at DESC',
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
    const {
      organizationId, title, processDescription,
      processBefore, processAfter, tool, teamSize,
      championName, championEmail,
      startDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
      departmentAreaId,
    } = req.body;

    const missing: string[] = [];
    if (!organizationId) missing.push('organizationId');
    if (!title) missing.push('title');
    if (!processBefore) missing.push('processBefore');
    if (!processAfter) missing.push('processAfter');
    if (!tool) missing.push('tool');
    if (teamSize == null) missing.push('teamSize');
    if (!championName) missing.push('championName');
    if (!championEmail) missing.push('championEmail');
    if (missing.length > 0) {
      res.status(400).json({
        message: `Campos requeridos faltantes: ${missing.join(', ')}`,
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const valueScore = calcValueScore(valuePnl, valueEffort, valueRisk, valueTimeToValue);
    const description = processDescription ?? title;

    const result = await query(
      `INSERT INTO pilots
         (organization_id, title, process_description, process_before, process_after,
          tool, team_size, champion_name, champion_email, status,
          start_date, implementation_type, cuj_id,
          value_pnl, value_pnl_type, value_effort, value_risk, value_time_to_value, value_score,
          department_area_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'designing', $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        organizationId, title, description, processBefore, processAfter,
        tool, teamSize, championName, championEmail,
        startDate ?? null, implementationType ?? 'redesign', cujId ?? null,
        valuePnl ?? null, valuePnlType ?? null,
        valueEffort ?? null, valueRisk ?? null, valueTimeToValue ?? null, valueScore,
        departmentAreaId ?? null,
      ],
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
      title, status, workflowDesign, championAssignments, roleImpacts,
      startDate,
      implementationType, cujId, valuePnl, valuePnlType, valueEffort, valueRisk, valueTimeToValue,
      departmentAreaId,
    } = req.body;

    const existing = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const valueScore = calcValueScore(valuePnl, valueEffort, valueRisk, valueTimeToValue);

    const result = await query(
      `UPDATE pilots SET
         title = COALESCE($1, title),
         status = COALESCE($2, status),
         workflow_design = COALESCE($3, workflow_design),
         champion_assignments = COALESCE($4, champion_assignments),
         role_impacts = COALESCE($5, role_impacts),
         start_date = COALESCE($6, start_date),
         implementation_type = COALESCE($7, implementation_type),
         cuj_id = $8,
         value_pnl = $9,
         value_pnl_type = $10,
         value_effort = $11,
         value_risk = $12,
         value_time_to_value = $13,
         value_score = COALESCE($14, value_score),
         department_area_id = COALESCE($15, department_area_id),
         updated_at = NOW()
       WHERE id = $16
       RETURNING *`,
      [
        title ?? null, status ?? null,
        workflowDesign ? JSON.stringify(workflowDesign) : null,
        championAssignments ? JSON.stringify(championAssignments) : null,
        roleImpacts ? JSON.stringify(roleImpacts) : null,
        startDate ?? null,
        implementationType ?? null, cujId !== undefined ? cujId : null,
        valuePnl !== undefined ? valuePnl : null,
        valuePnlType !== undefined ? valuePnlType : null,
        valueEffort !== undefined ? valueEffort : null,
        valueRisk !== undefined ? valueRisk : null,
        valueTimeToValue !== undefined ? valueTimeToValue : null,
        valueScore, departmentAreaId ?? null, req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/metrics — Agregar entrada de métricas (incluye adoptionMetrics)
// Body esperado: { date: string ISO, values: Record<string, number>, adoptionMetrics?, notes? }
router.post('/:id/metrics', async (req, res, next) => {
  try {
    const { date, values, adoptionMetrics, notes } = req.body;

    if (!date || !values) {
      res.status(400).json({
        message: 'Los campos date y values son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const pilotExists = await getOne('SELECT id FROM pilots WHERE id = $1', [req.params.id]);
    if (!pilotExists) {
      res.status(404).json({ message: 'Piloto no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO pilot_metrics (pilot_id, date, values, adoption_metrics, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.params.id,
        date,
        JSON.stringify(values),
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
         committee_decision_date = COALESCE($2, committee_decision_date),
         updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [committeeDecision, decisionDate ?? null, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
