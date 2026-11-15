import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { AuthPayload } from '../types/index.js';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    throw new UnauthorizedError('Authentication token missing');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload & { id?: string; email?: string; isAdmin?: boolean };

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const role = decoded.role || (decoded.isAdmin ? 'admin' : 'user');

    req.user = { userId, role };
    req.userId = userId;
    req.token = token;

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired authentication token', error));
    }
  }
};
