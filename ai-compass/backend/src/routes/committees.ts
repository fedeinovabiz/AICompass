import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';
import { query, getOne, getMany } from '../db';
import { FOUNDATIONAL_DECISIONS } from '../constants/foundationalDecisions';

const router = Router();
router.use(authMiddleware);

// GET /organization/:orgId — Obtener comité con members, decisions, meetings
router.get('/organization/:orgId', async (req, res, next) => {
  try {
    const committee = await getOne(
      'SELECT * FROM committees WHERE organization_id = $1',
      [req.params.orgId],
    );
    if (!committee) {
      res.status(404).json({ message: 'Comité no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const committeeId = (committee as { id: string }).id;
    const [members, decisions, meetings] = await Promise.all([
      getMany('SELECT * FROM committee_members WHERE committee_id = $1 ORDER BY created_at', [committeeId]),
      getMany('SELECT * FROM committee_decisions WHERE committee_id = $1 ORDER BY decision_number', [committeeId]),
      getMany('SELECT * FROM committee_meetings WHERE committee_id = $1 ORDER BY meeting_date DESC', [committeeId]),
    ]);

    res.json({ ...committee as object, members, decisions, meetings });
  } catch (err) {
    next(err);
  }
});

// POST / — Crear comité e insertar las 8 decisiones fundacionales
router.post('/', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { organizationId, meetingCadence } = req.body;
    if (!organizationId) {
      res.status(400).json({ message: 'El campo organizationId es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const result = await query(
      `INSERT INTO committees (organization_id, meeting_cadence)
       VALUES ($1, $2)
       RETURNING *`,
      [organizationId, meetingCadence ?? null],
    );

    const committee = result.rows[0];

    // Insertar las 8 decisiones fundacionales
    for (const decision of FOUNDATIONAL_DECISIONS) {
      await query(
        `INSERT INTO committee_decisions (committee_id, decision_number, title, description, placeholder, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          committee.id,
          decision.number,
          decision.title,
          decision.description,
          decision.placeholder,
          decision.options ? JSON.stringify(decision.options) : null,
        ],
      );
    }

    res.status(201).json(committee);
  } catch (err) {
    next(err);
  }
});

// POST /:id/members — Agregar miembro
router.post('/:id/members', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { name, role, email, area } = req.body;
    if (!name || !role) {
      res.status(400).json({ message: 'Los campos name y role son requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const committeeExists = await getOne('SELECT id FROM committees WHERE id = $1', [req.params.id]);
    if (!committeeExists) {
      res.status(404).json({ message: 'Comité no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO committee_members (committee_id, name, role, email, area)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.params.id, name, role, email ?? null, area ?? null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /:committeeId/members/:memberId — Eliminar miembro
router.delete('/:committeeId/members/:memberId', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const { committeeId, memberId } = req.params;

    const existing = await getOne(
      'SELECT id FROM committee_members WHERE committee_id = $1 AND id = $2',
      [committeeId, memberId],
    );
    if (!existing) {
      res.status(404).json({ message: 'Miembro no encontrado', code: 'NOT_FOUND' });
      return;
    }

    await query('DELETE FROM committee_members WHERE committee_id = $1 AND id = $2', [committeeId, memberId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PUT /:committeeId/decisions/:number — Actualizar respuesta de decisión
router.put('/:committeeId/decisions/:number', async (req, res, next) => {
  try {
    const { committeeId, number } = req.params;
    const { answer, decidedAt } = req.body;

    const existing = await getOne(
      'SELECT id FROM committee_decisions WHERE committee_id = $1 AND decision_number = $2',
      [committeeId, parseInt(number, 10)],
    );
    if (!existing) {
      res.status(404).json({ message: 'Decisión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE committee_decisions SET
         answer = COALESCE($1, answer),
         decided_at = COALESCE($2, decided_at),
         updated_at = NOW()
       WHERE committee_id = $3 AND decision_number = $4
       RETURNING *`,
      [answer ?? null, decidedAt ?? null, committeeId, parseInt(number, 10)],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/constitute — Constituir comité (set constitutedAt)
router.post('/:id/constitute', roleGuard('facilitator', 'admin'), async (req, res, next) => {
  try {
    const existing = await getOne('SELECT id FROM committees WHERE id = $1', [req.params.id]);
    if (!existing) {
      res.status(404).json({ message: 'Comité no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `UPDATE committees SET constituted_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id],
    );

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /:id/meetings — Registrar reunión
router.post('/:id/meetings', async (req, res, next) => {
  try {
    const { meetingDate, notes, attendees } = req.body;
    if (!meetingDate) {
      res.status(400).json({ message: 'El campo meetingDate es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const committeeExists = await getOne('SELECT id FROM committees WHERE id = $1', [req.params.id]);
    if (!committeeExists) {
      res.status(404).json({ message: 'Comité no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const result = await query(
      `INSERT INTO committee_meetings (committee_id, meeting_date, notes, attendees)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.params.id, meetingDate, notes ?? null, attendees ? JSON.stringify(attendees) : null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
