import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  details?: unknown;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
  const status = err.statusCode || 500;
  const dev = process.env.NODE_ENV === 'development';

  console.error(`💥 [${req.method}] ${req.url} → ${status}: ${err.message}`);
  if (dev) console.error(err.stack);

  res.status(status).json({
    status: 'error',
    message: err.message || 'Error interno del servidor.',
    ...(dev && { stack: err.stack }),
    ...(err.details && { details: err.details }),
  });
}
