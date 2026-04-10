import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

interface PgError extends Error {
  code?: string;
  constraint?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err.statusCode) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code || 'DOMAIN_ERROR',
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ message: 'JSON inválido', code: 'INVALID_JSON' });
    return;
  }

  const pgError = err as PgError;
  if (pgError.code === '23505') {
    res.status(409).json({ message: 'El registro ya existe', code: 'DUPLICATE' });
    return;
  }
  if (pgError.code === '23503') {
    res.status(404).json({
      message: 'Recurso relacionado no encontrado',
      code: 'FK_NOT_FOUND',
    });
    return;
  }

  const response: Record<string, unknown> = {
    message: 'Error interno del servidor',
    code: 'INTERNAL_ERROR',
  };
  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
    response.originalMessage = err.message;
  }
  res.status(500).json(response);
}
