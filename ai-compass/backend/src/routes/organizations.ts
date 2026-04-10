import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';

const router = Router();
router.use(authMiddleware);

// GET / — Lista organizaciones según rol
router.get('/', async (req, res, next) => {
  try {
    const { role, userId, organizationId } = req.user!;

    if (role === 'admin') {
      const orgs = await getMany(
        'SELECT * FROM organizations ORDER BY created_at DESC',
      );
      res.json(orgs);
      return;
    }

    if (role === 'facilitator') {
      const orgs = await getMany(
        `SELECT DISTINCT o.*
         FROM organizations o
         INNER JOIN engagements e ON e.organization_id = o.id
         WHERE e.facilitator_id = $1
         ORDER BY o.created_at DESC`,
        [userId],
      );
      res.json(orgs);
      return;
    }

    // council: solo su propia organización
    if (!organizationId) {
      res.json([]);
      return;
    }
    const org = await getOne('SELECT * FROM organizations WHERE id = $1', [organizationId]);
    res.json(org ? [org] : []);
  } catch (err) {
    next(err);
  }
});

// GET /:id — Detalle de una organización
router.get('/:id', async (req, res, next) => {
  try {
    const org = await getOne('SELECT * FROM organizations WHERE id = $1', [req.params.id]);
    if (!org) {
      res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });
      return;
    }
    res.json(org);
  } catch (err) {
    next(err);
  }
});

// POST / — Crear organización (solo facilitator/admin)
router.post('/', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { name, industry, size, contactName, contactEmail } = req.body;
    if (!name) {
      res.status(400).json({ message: 'El campo name es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `INSERT INTO organizations (name, industry, size, contact_name, contact_email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, industry ?? null, size ?? null, contactName ?? null, contactEmail ?? null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /:id — Actualizar organización (solo facilitator/admin)
router.put('/:id', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { name, industry, size, contactName, contactEmail, currentStage, maturityScores, stageCriteria } = req.body;

    const existing = await getOne('SELECT id FROM organizations WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Organización no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE organizations SET
         name = COALESCE($1, name),
         industry = COALESCE($2, industry),
         size = COALESCE($3, size),
         contact_name = COALESCE($4, contact_name),
         contact_email = COALESCE($5, contact_email),
         current_stage = COALESCE($6, current_stage),
         maturity_scores = COALESCE($7, maturity_scores),
         stage_criteria = COALESCE($8, stage_criteria),
         updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        name ?? null,
        industry ?? null,
        size ?? null,
        contactName ?? null,
        contactEmail ?? null,
        currentStage ?? null,
        maturityScores ? JSON.stringify(maturityScores) : null,
        stageCriteria ? JSON.stringify(stageCriteria) : null,
        req.params.id,
      ],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
