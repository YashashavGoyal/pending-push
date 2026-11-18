import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error.js';
import { AuthPayload } from '../types/index.js';

export const authPreHandler = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  const authHeader = request.headers.authorization;

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

    request.user = { userId, role };
    request.userId = userId;
    request.token = token;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Invalid or expired authentication token', error);
  }
};

export const optionalAuthPreHandler = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  const authHeader = request.headers.authorization;
  if (!authHeader) return;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload & { id?: string; email?: string; isAdmin?: boolean };
    const userId = decoded.userId || decoded.id;
    if (userId) {
      const role = decoded.role || (decoded.isAdmin ? 'admin' : 'user');
      request.user = { userId, role };
      request.userId = userId;
      request.token = token;
    }
  } catch {
    // Ignore token errors on optional auth routes
  }
};

export const adminPreHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  await authPreHandler(request, reply);
  if (request.user?.role !== 'admin') {
    throw new ForbiddenError('Administrator privileges required');
  }
};
