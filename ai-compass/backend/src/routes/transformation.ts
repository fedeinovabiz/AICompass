// ══════════════════════════════════════════════
// TRANSFORMATION ROUTES — Dashboard de Transformación (Etapa 5)
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// ── GET /organization/:orgId/summary ──────────────────────────────────────────
// KPIs acumulados de transformación
router.get('/organization/:orgId/summary', async (req, res, next) => {
  try {
    const { orgId } = req.params;

    // Total procesos rediseñados (process_maps con status 'approved' o 'implementing')
    let totalProcessesRedesigned = 0;
    try {
      const processResult = await query(
        `SELECT COUNT(*) AS count FROM process_maps
         WHERE organization_id = $1 AND status IN ('approved', 'implementing')`,
        [orgId],
      );
      totalProcessesRedesigned = parseInt(String(processResult.rows[0]?.count ?? '0'));
    } catch {
      // La tabla puede no existir aún
      totalProcessesRedesigned = 0;
    }

    // Horas liberadas: SUM estimated_hours_saved_weekly de process_maps aprobados/implementando
    let hoursFreed = 0;
    try {
      const hoursResult = await query(
        `SELECT COALESCE(SUM(estimated_hours_saved_weekly), 0) AS total
         FROM process_maps
         WHERE organization_id = $1 AND status IN ('approved', 'implementing')`,
        [orgId],
      );
      hoursFreed = parseFloat(String(hoursResult.rows[0]?.total ?? '0'));
    } catch {
      hoursFreed = 0;
    }

    // Herramientas IA activas y costo mensual total
    const toolsResult = await query(
      `SELECT COUNT(*) AS active_count, COALESCE(SUM(monthly_cost), 0) AS total_monthly_cost
       FROM ai_tool_catalog
       WHERE organization_id = $1 AND status = 'active'`,
      [orgId],
    );
    const aiToolsAdopted = parseInt(String(toolsResult.rows[0]?.active_count ?? '0'));
    const totalMonthlyCost = parseFloat(String(toolsResult.rows[0]?.total_monthly_cost ?? '0'));

    // ROI estimado: (horas_liberadas * 25) - (costo_mensual * meses_activos)
    // Aproximación: 3 meses de actividad como base
    const revenueFromHours = hoursFreed * 25;
    const costToDate = totalMonthlyCost * 3;
    const estimatedRoi = Math.round(revenueFromHours - costToDate);

    // Evolución de madurez: primer análisis cross-session vs maturity_scores actual
    const firstAnalysisResult = await query(
      `SELECT dimension_scores FROM cross_session_analyses
       WHERE organization_id = $1
       ORDER BY generated_at ASC
       LIMIT 1`,
      [orgId],
    );
    const latestAnalysisResult = await query(
      `SELECT dimension_scores FROM cross_session_analyses
       WHERE organization_id = $1
       ORDER BY generated_at DESC
       LIMIT 1`,
      [orgId],
    );

    const maturityEvolution = {
      first: (firstAnalysisResult.rows[0]?.dimension_scores as Record<string, { score: number }>) ?? null,
      current: (latestAnalysisResult.rows[0]?.dimension_scores as Record<string, { score: number }>) ?? null,
    };

    res.json({
      totalProcessesRedesigned,
      hoursFreed,
      estimatedRoi,
      aiToolsAdopted,
      maturityEvolution,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /organization/:orgId/tools ────────────────────────────────────────────
// Lista herramientas IA de la organización
router.get('/organization/:orgId/tools', async (req, res, next) => {
  try {
    const tools = await getMany(
      `SELECT * FROM ai_tool_catalog
       WHERE organization_id = $1
       ORDER BY added_at DESC`,
      [req.params.orgId],
    );
    res.json(tools);
  } catch (err) {
    next(err);
  }
});

// ── POST /organization/:orgId/tools ───────────────────────────────────────────
// Crear herramienta IA
router.post('/organization/:orgId/tools', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { name, category, licenses, monthlyCost, teamsUsing, status } = req.body as {
      name: string;
      category: string;
      licenses?: number;
      monthlyCost?: number;
      teamsUsing?: string[];
      status?: string;
    };

    if (!name || !category) {
      res.status(400).json({ message: 'Los campos name y category son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const validCategories = ['llm', 'no-code', 'custom', 'analytics', 'other'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ message: 'Categoría inválida', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `INSERT INTO ai_tool_catalog
         (organization_id, name, category, licenses, monthly_cost, teams_using, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.params.orgId,
        name,
        category,
        licenses ?? 0,
        monthlyCost ?? 0,
        JSON.stringify(teamsUsing ?? []),
        status ?? 'active',
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── PUT /tools/:id ────────────────────────────────────────────────────────────
// Actualizar herramienta IA
router.put('/tools/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { name, category, licenses, monthlyCost, teamsUsing, status } = req.body as {
      name?: string;
      category?: string;
      licenses?: number;
      monthlyCost?: number;
      teamsUsing?: string[];
      status?: string;
    };

    const result = await query(
      `UPDATE ai_tool_catalog SET
         name = COALESCE($1, name),
         category = COALESCE($2, category),
         licenses = COALESCE($3, licenses),
         monthly_cost = COALESCE($4, monthly_cost),
         teams_using = COALESCE($5, teams_using),
         status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [
        name ?? null,
        category ?? null,
        licenses ?? null,
        monthlyCost ?? null,
        teamsUsing !== undefined ? JSON.stringify(teamsUsing) : null,
        status ?? null,
        req.params.id,
      ],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Herramienta no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /tools/:id ─────────────────────────────────────────────────────────
// Eliminar herramienta IA
router.delete('/tools/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const result = await query(
      'DELETE FROM ai_tool_catalog WHERE id = $1 RETURNING id',
      [req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Herramienta no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── GET /organization/:orgId/governance-evolutions ────────────────────────────
// Lista evoluciones de decisiones fundacionales
router.get('/organization/:orgId/governance-evolutions', async (req, res, next) => {
  try {
    const evolutions = await getMany(
      `SELECT * FROM governance_evolutions
       WHERE organization_id = $1
       ORDER BY evolution_date DESC, created_at DESC`,
      [req.params.orgId],
    );
    res.json(evolutions);
  } catch (err) {
    next(err);
  }
});

// ── POST /organization/:orgId/governance-evolutions ───────────────────────────
// Registrar evolución de decisión fundacional
router.post('/organization/:orgId/governance-evolutions', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { originalDecisionNumber, evolutionDate, changeDescription, decidedBy } = req.body as {
      originalDecisionNumber: number;
      evolutionDate: string;
      changeDescription: string;
      decidedBy?: string;
    };

    if (!originalDecisionNumber || !evolutionDate || !changeDescription) {
      res.status(400).json({
        message: 'Los campos originalDecisionNumber, evolutionDate y changeDescription son requeridos',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await query(
      `INSERT INTO governance_evolutions
         (organization_id, original_decision_number, evolution_date, change_description, decided_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.params.orgId,
        originalDecisionNumber,
        evolutionDate,
        changeDescription,
        decidedBy ?? null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
