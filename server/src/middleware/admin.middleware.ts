import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

export const adminMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw new UnauthorizedError('User must be authenticated');
  }

  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Access denied: administrator privileges required');
  }

  next();
};
