import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RolUsuario, UsuarioPayload } from './auth.types';

export interface AuthRequest extends Request {
  user?: UsuarioPayload;
}

export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Token no proporcionado.' });
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UsuarioPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' });
  }
}

export function requerirRol(...roles: RolUsuario[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'No autenticado.' });
    }
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ status: 'error', message: 'Sin permiso para esta acción.' });
    }
    next();
  };
}
