import { Request, Response, NextFunction } from 'express';

export function roleGuard(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado', code: 'UNAUTHORIZED' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: 'Sin permisos para esta acción', code: 'FORBIDDEN' });
      return;
    }
    next();
  };
}
