import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Lista engagements de una organización
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const engagements = await getMany(
      `SELECT e.*, u.name AS facilitator_name, u.email AS facilitator_email
       FROM engagements e
       LEFT JOIN users u ON u.id = e.facilitator_id
       WHERE e.organization_id = $1
       ORDER BY e.created_at DESC`,
      [req.params.orgId],
    );
    res.json(engagements);
  } catch (err) {
    next(err);
  }
});

// POST / — Crear engagement (facilitator/admin)
router.post('/', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { organizationId, startDate, endDate, status } = req.body;
    if (!organizationId) {
      res.status(400).json({ message: 'El campo organizationId es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const facilitatorId = req.user!.userId;

    const result = await query(
      `INSERT INTO engagements (organization_id, facilitator_id, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [organizationId, facilitatorId, startDate ?? null, endDate ?? null, status ?? 'active'],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar estado/endDate
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { status, endDate } = req.body;

    const existing = await getOne('SELECT id FROM engagements WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Engagement no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE engagements SET
         status = COALESCE($1, status),
         end_date = COALESCE($2, end_date),
         updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status ?? null, endDate ?? null, req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
