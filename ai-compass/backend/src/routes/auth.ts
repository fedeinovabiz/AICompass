import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { getOne, query } from '../db';
import { authMiddleware } from '../middleware/auth';
import { roleGuard } from '../middleware/roleGuard';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña requeridos', code: 'VALIDATION_ERROR' });
      return;
    }

    const user = await getOne<{ id: string; email: string; password_hash: string; name: string; role: string; organization_id: string | null }>(
      'SELECT id, email, password_hash, name, role, organization_id FROM users WHERE email = $1',
      [email]
    );

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'Credenciales incorrectas', code: 'INVALID_CREDENTIALS' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, organizationId: user.organization_id },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, organizationId: user.organization_id },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register', authMiddleware, roleGuard('admin'), async (req, res, next) => {
  try {
    const { email, password, name, role, organizationId } = req.body;
    if (!email || !password || !name || !role) {
      res.status(400).json({ message: 'Campos requeridos: email, password, name, role', code: 'VALIDATION_ERROR' });
      return;
    }

    const existing = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) {
      res.status(409).json({ message: 'Email ya registrado', code: 'DUPLICATE_EMAIL' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role, organization_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, organization_id, created_at',
      [email, passwordHash, name, role, organizationId || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await getOne(
      'SELECT id, email, name, role, organization_id, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado', code: 'NOT_FOUND' });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
