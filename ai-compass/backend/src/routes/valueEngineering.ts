// ══════════════════════════════════════════════
// VALUE ENGINEERING — Matriz de priorización
// ══════════════════════════════════════════════

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Matriz de priorización de pilotos
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    type PilotRow = {
      id: string;
      title: string;
      status: string;
      tool: string | null;
      value_pnl: number | null;
      value_pnl_type: string | null;
      value_effort: string | null;
      value_risk: string | null;
      value_time_to_value: string | null;
      value_score: number | null;
      implementation_type: string | null;
      cuj_id: string | null;
      start_date: string | null;
      committee_decision: string | null;
    };

    const pilots = await getMany<PilotRow>(
      `SELECT id, title, status, tool, value_pnl, value_pnl_type,
              value_effort, value_risk, value_time_to_value, value_score,
              implementation_type, cuj_id, start_date, committee_decision
       FROM pilots
       WHERE organization_id = $1
       ORDER BY value_score DESC NULLS LAST, created_at DESC`,
      [req.params.orgId],
    );

    const conScore = pilots.filter((p) => p.value_score !== null);
    const sinScore = pilots.filter((p) => p.value_score === null);
    const totalPnl = conScore.reduce((sum, p) => sum + (p.value_pnl ?? 0), 0);

    res.json({
      pilots,
      summary: {
        total: pilots.length,
        evaluated: conScore.length,
        pending: sinScore.length,
        totalPnl,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
