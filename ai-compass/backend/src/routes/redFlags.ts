// ══════════════════════════════════════════════
// RED FLAGS — Rutas de alertas organizacionales
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { query, getOne, getMany } from '../db';
import { evaluateRedFlags } from '../services/redFlagEvaluator';
import type { OrgState } from '../services/redFlagEvaluator';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Evalúa y retorna red flags activos
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const { orgId } = req.params;

    // Cargar organización
    const org = await getOne<{
      id: string;
      current_stage: number;
      maturity_scores: Record<string, number | null>;
    }>('SELECT id, current_stage, maturity_scores FROM organizations WHERE id = $1', [orgId]);

    if (!org) {
      res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });
      return;
    }

    // Cargar sesiones con participantes
    const sesiones = await getMany<{
      id: string;
      type: string;
      status: string;
    }>('SELECT id, type, status FROM sessions WHERE engagement_id IN (SELECT id FROM engagements WHERE organization_id = $1)', [orgId]);

    const sesionesConParticipantes = await Promise.all(
      sesiones.map(async (s) => {
        const participantes = await getMany<{ role: string }>(
          'SELECT role FROM session_participants WHERE session_id = $1',
          [s.id],
        );
        return {
          type: s.type,
          status: s.status,
          participants: participantes,
        };
      }),
    );

    // Cargar comité con members, decisions y meetings
    const committee = await getOne<{ id: string }>(
      'SELECT id FROM committees WHERE organization_id = $1',
      [orgId],
    );

    let committeeData: OrgState['committee'] = null;
    if (committee) {
      const [members, decisions, meetings] = await Promise.all([
        getMany<{ role: string }>('SELECT role FROM committee_members WHERE committee_id = $1', [committee.id]),
        getMany<{ response: string }>('SELECT COALESCE(response, \'\') as response FROM foundational_decisions WHERE committee_id = $1', [committee.id]),
        getMany<{ attendees: string[] }>('SELECT COALESCE(attendees, \'[]\'::jsonb) as attendees FROM committee_meetings WHERE committee_id = $1 ORDER BY date DESC', [committee.id]),
      ]);
      committeeData = { members, decisions, meetings };
    }

    // Cargar pilotos con métricas
    const pilotosRaw = await getMany<{
      id: string;
      status: string;
      baseline: unknown;
      start_date: string | null;
      implementation_type: string | null;
      cuj_id: string | null;
      value_pnl: number | null;
      value_effort: string | null;
    }>('SELECT id, status, baseline, start_date, implementation_type, cuj_id, value_pnl, value_effort FROM pilots WHERE organization_id = $1', [orgId]);

    const pilotos = await Promise.all(
      pilotosRaw.map(async (p) => {
        const metrics = await getMany<unknown>(
          'SELECT adoption_metrics FROM pilot_metrics WHERE pilot_id = $1 ORDER BY recorded_at DESC',
          [p.id],
        );
        const baselineArr = Array.isArray(p.baseline) ? p.baseline : (p.baseline ? [p.baseline] : []);
        return {
          status: p.status,
          baseline: baselineArr,
          startDate: p.start_date,
          metrics,
          implementationType: p.implementation_type,
          cujId: p.cuj_id,
          valuePnl: p.value_pnl,
          valueEffort: p.value_effort,
        };
      }),
    );

    // Construir estado de la organización
    const orgState: OrgState = {
      currentStage: org.current_stage ?? 1,
      maturityScores: org.maturity_scores ?? {},
      sessions: sesionesConParticipantes,
      committee: committeeData,
      pilots: pilotos,
    };

    // Evaluar red flags
    const redFlagsActivos = evaluateRedFlags(orgState);

    // Persistir red flags detectados (upsert por ruleId + orgId)
    for (const flag of redFlagsActivos) {
      await query(
        `INSERT INTO red_flags (organization_id, rule_id, severity, title, description, stage)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (organization_id, rule_id)
         DO UPDATE SET
           severity = EXCLUDED.severity,
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           detected_at = NOW()
         WHERE red_flags.resolved_at IS NULL`,
        [orgId, flag.ruleId, flag.severity, flag.title, flag.description, flag.stage],
      ).catch(() => {
        // Si la tabla no existe, continuar sin error fatal
      });
    }

    res.json(redFlagsActivos);
  } catch (err) {
    next(err);
  }
});

// PUT /organization/:orgId/flags/:ruleId/resolve — Marcar como resuelto
router.put('/organization/:orgId/flags/:ruleId/resolve', async (req, res, next) => {
  try {
    const { orgId, ruleId } = req.params;
    const { resolution } = req.body as { resolution?: string };

    await query(
      `UPDATE red_flags SET resolved_at = NOW(), resolution = $1
       WHERE organization_id = $2 AND rule_id = $3 AND resolved_at IS NULL`,
      [resolution ?? null, orgId, ruleId],
    ).catch(() => {});

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUT /organization/:orgId/flags/:ruleId/override — Registrar override con justificación
router.put('/organization/:orgId/flags/:ruleId/override', async (req, res, next) => {
  try {
    const { orgId, ruleId } = req.params;
    const { justification } = req.body as { justification?: string };

    await query(
      `UPDATE red_flags SET override_justification = $1, resolved_at = NOW()
       WHERE organization_id = $2 AND rule_id = $3 AND resolved_at IS NULL`,
      [justification ?? null, orgId, ruleId],
    ).catch(() => {});

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
