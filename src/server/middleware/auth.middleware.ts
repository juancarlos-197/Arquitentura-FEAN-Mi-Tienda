import { NextFunction, Request, Response } from 'express';
import { store } from '../data/store';
import { UserRole } from '../../app/shared/models';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // For convenience in public demo mode or unauthenticated requests, allow guest or require auth
    return next();
  }

  const token = authHeader.substring(7);
  try {
    // In our FEAN architecture, token can be a simulated signed Firebase JWT: `fb_token_${userId}`
    if (token.startsWith('fean_token_')) {
      const userId = token.replace('fean_token_', '');
      const user = store.getUserById(userId);
      if (user && user.active) {
        req.user = { id: user.id, email: user.email, role: user.role };
      }
    }
  } catch (err) {
    console.error('Auth token decode error:', err);
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Acceso no autorizado: Token requerido' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Permisos insuficientes para esta operación' });
      return;
    }
    next();
  };
}
