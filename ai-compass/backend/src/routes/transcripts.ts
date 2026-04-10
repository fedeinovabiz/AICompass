import { Router, Request } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import { getOne, query } from '../db';
import { parseTranscript, detectFormat } from '../services/transcriptParser';

const router = Router();
router.use(authMiddleware);

const upload = multer({ storage: multer.memoryStorage() });

// POST /:sessionId — Upload de archivo (multer)
router.post('/:sessionId', upload.single('file'), async (req: Request, res, next) => {
  try {
    const { sessionId } = req.params;

    const session = await getOne('SELECT id FROM sessions WHERE id = $1', [sessionId]);
    if (!session) {
      res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Archivo requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const format = detectFormat(req.file.originalname);
    const content = req.file.buffer.toString('utf-8');
    const parsed = parseTranscript(content, format);

    await query(
      `UPDATE sessions SET transcript_text = $1, updated_at = NOW() WHERE id = $2`,
      [parsed.text, sessionId],
    );

    res.json({
      sessionId,
      wordCount: parsed.wordCount,
      segmentCount: parsed.segments.length,
      format,
    });
  } catch (err) {
    next(err);
  }
});

// POST /:sessionId/text — Texto directo (pegar)
router.post('/:sessionId/text', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;

    if (!text) {
      res.status(400).json({ message: 'El campo text es requerido', code: 'VALIDATION_ERROR' });
      return;
    }

    const session = await getOne('SELECT id FROM sessions WHERE id = $1', [sessionId]);
    if (!session) {
      res.status(404).json({ message: 'Sesión no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const parsed = parseTranscript(text, 'text');

    await query(
      `UPDATE sessions SET transcript_text = $1, updated_at = NOW() WHERE id = $2`,
      [parsed.text, sessionId],
    );

    res.json({
      sessionId,
      wordCount: parsed.wordCount,
      segmentCount: parsed.segments.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
