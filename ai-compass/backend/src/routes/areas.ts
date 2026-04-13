import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';
import {
  calculateAiOperatingLevel,
  calculateAiLevelForArea,
  AI_LEVEL_LABELS,
} from '../services/aiOperatingLevel';
import type { AiLevelInput } from '../services/aiOperatingLevel';

const router = Router();
router.use(authMiddleware);

// Helper: cargar datos para cálculo de AI Level de una org
async function loadAiLevelInput(orgId: string): Promise<AiLevelInput> {
  const pilots = await getMany(
    `SELECT status, implementation_type, tool, department_area_id FROM pilots WHERE organization_id = $1`,
    [orgId],
  );
  const aiTools = await getMany(
    `SELECT status, category, teams_using FROM ai_tools WHERE organization_id = $1`,
    [orgId],
  ).catch(() => [] as Array<Record<string, unknown>>);
  const processes = await getMany(
    `SELECT status FROM process_maps WHERE organization_id = $1`,
    [orgId],
  ).catch(() => [] as Array<Record<string, unknown>>);
  const committee = await getOne(
    `SELECT id FROM committees WHERE organization_id = $1`,
    [orgId],
  );
  let hasAgentGovernanceOwner = false;
  if (committee) {
    const owner = await getOne(
      `SELECT id FROM committee_members WHERE committee_id = $1 AND role IN ('it-rep', 'operational-leader')`,
      [(committee as { id: string }).id],
    );
    hasAgentGovernanceOwner = !!owner;
  }

  return {
    pilots: (pilots as Array<Record<string, unknown>>).map(p => ({
      status: p.status as string,
      implementationType: p.implementation_type as string | null,
      tool: p.tool as string | null,
      departmentAreaId: p.department_area_id as string | null,
    })),
    aiTools: (aiTools as Array<Record<string, unknown>>).map(t => ({
      status: t.status as string,
      category: t.category as string,
      teamsUsing: (t.teams_using as string[]) ?? [],
    })),
    processes: (processes as Array<Record<string, unknown>>).map(p => ({
      status: p.status as string,
    })),
    hasAgentGovernanceOwner,
  };
}

// GET /ai-level/organization/:orgId — AI Operating Level global + por área
router.get('/ai-level/organization/:orgId', async (req, res, next) => {
  try {
    const aiInput = await loadAiLevelInput(req.params.orgId);
    const globalLevel = calculateAiOperatingLevel(aiInput);

    const areas = await getMany(
      'SELECT id, display_name, assessment_status FROM department_areas WHERE organization_id = $1',
      [req.params.orgId],
    );

    const areaLevels = (areas as Array<Record<string, unknown>>).map(area => {
      const areaId = area.id as string;
      const areaPilots = aiInput.pilots.filter(p => p.departmentAreaId === areaId);
      const level = areaPilots.length > 0
        ? calculateAiLevelForArea(areaId, aiInput)
        : null;

      return {
        areaId,
        displayName: area.display_name,
        assessmentStatus: area.assessment_status,
        aiOperatingLevel: level,
        aiOperatingLevelLabel: level ? AI_LEVEL_LABELS[level] : null,
      };
    });

    res.json({
      global: {
        aiOperatingLevel: globalLevel,
        aiOperatingLevelLabel: AI_LEVEL_LABELS[globalLevel],
      },
      areas: areaLevels,
    });
  } catch (err) {
    next(err);
  }
});

// GET /organization/:orgId — Lista áreas de la organización
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const areas = await getMany(
      'SELECT * FROM department_areas WHERE organization_id = $1 ORDER BY display_name',
      [req.params.orgId],
    );

    const aiInput = await loadAiLevelInput(req.params.orgId);

    const areasWithLevel = (areas as Array<Record<string, unknown>>).map(area => {
      const areaId = area.id as string;
      const areaPilots = aiInput.pilots.filter(p => p.departmentAreaId === areaId);
      const level = areaPilots.length > 0
        ? calculateAiLevelForArea(areaId, aiInput)
        : null;

      return {
        ...area,
        aiOperatingLevel: level,
        aiOperatingLevelLabel: level ? AI_LEVEL_LABELS[level] : null,
        pilotCount: areaPilots.length,
      };
    });

    res.json(areasWithLevel);
  } catch (err) {
    next(err);
  }
});

// POST / — Crear área (hereda scores del baseline org)
router.post('/', async (req, res, next) => {
  try {
    const { organizationId, standardArea, customName } = req.body;
    if (!organizationId || !standardArea) {
      res.status(400).json({ message: 'organizationId y standardArea son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const org = await getOne(
      'SELECT maturity_scores FROM organizations WHERE id = $1',
      [organizationId],
    );
    const orgScores = org ? (org as { maturity_scores: Record<string, number | null> }).maturity_scores : {};

    const displayName = customName ?? standardArea;

    const result = await query(
      `INSERT INTO department_areas (organization_id, standard_area, custom_name, display_name, maturity_scores, assessment_status)
       VALUES ($1, $2, $3, $4, $5, 'inherited')
       RETURNING *`,
      [organizationId, standardArea, customName ?? null, displayName, JSON.stringify(orgScores)],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de área con pilotos vinculados
router.get('/:id', async (req, res, next) => {
  try {
    const area = await getOne('SELECT * FROM department_areas WHERE id = $1', [req.params.id]);
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const areaData = area as Record<string, unknown>;
    const orgId = areaData.organization_id as string;

    const pilots = await getMany(
      'SELECT * FROM pilots WHERE department_area_id = $1 ORDER BY created_at DESC',
      [req.params.id],
    );

    const aiInput = await loadAiLevelInput(orgId);
    const level = calculateAiLevelForArea(req.params.id, aiInput);

    res.json({
      ...areaData,
      pilots,
      aiOperatingLevel: level,
      aiOperatingLevelLabel: AI_LEVEL_LABELS[level],
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar área
router.put('/:id', async (req, res, next) => {
  try {
    const { displayName, standardArea, customName } = req.body;

    const result = await query(
      `UPDATE department_areas SET
         display_name = COALESCE($1, display_name),
         standard_area = COALESCE($2, standard_area),
         custom_name = COALESCE($3, custom_name),
         updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [displayName ?? null, standardArea ?? null, customName ?? null, req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:id — Eliminar área (solo si no tiene pilotos)
router.delete('/:id', async (req, res, next) => {
  try {
    const pilotCount = await getOne(
      'SELECT COUNT(*) as count FROM pilots WHERE department_area_id = $1',
      [req.params.id],
    );
    if (pilotCount && Number((pilotCount as { count: string }).count) > 0) {
      res.status(400).json({
        message: 'No se puede eliminar un área con pilotos vinculados',
        code: 'HAS_PILOTS',
      });
      return;
    }

    const result = await query('DELETE FROM department_areas WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /:id/mini-assessment — Guardar mini-assessment y actualizar scores
router.post('/:id/mini-assessment', async (req, res, next) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ message: 'El campo answers (array) es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const scoresByDimension: Record<string, number[]> = {};
    for (const answer of answers) {
      const dim = answer.dimension as string;
      const level = answer.suggestedLevel as number;
      if (!scoresByDimension[dim]) scoresByDimension[dim] = [];
      scoresByDimension[dim].push(level);
    }

    const maturityScores: Record<string, number> = {};
    for (const [dim, levels] of Object.entries(scoresByDimension)) {
      maturityScores[dim] = Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
    }

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         assessment_status = 'mini-assessed',
         assessed_at = NOW(),
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(maturityScores), req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/scores — Override manual de scores
router.put('/:id/scores', async (req, res, next) => {
  try {
    const { maturityScores } = req.body;
    if (!maturityScores) {
      res.status(400).json({ message: 'El campo maturityScores es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(maturityScores), req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/reset-to-inherited — Volver a scores heredados
router.post('/:id/reset-to-inherited', async (req, res, next) => {
  try {
    const area = await getOne('SELECT organization_id FROM department_areas WHERE id = $1', [req.params.id]);
    if (!area) {
      res.status(404).json({ message: 'Área no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const orgId = (area as { organization_id: string }).organization_id;
    const org = await getOne('SELECT maturity_scores FROM organizations WHERE id = $1', [orgId]);
    const orgScores = org ? (org as { maturity_scores: Record<string, number | null> }).maturity_scores : {};

    const result = await query(
      `UPDATE department_areas SET
         maturity_scores = $1,
         assessment_status = 'inherited',
         assessed_at = NULL,
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(orgScores), req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
