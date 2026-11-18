import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError } from '../errors/app-error.js';
import { authPreHandler } from './auth.middleware.js';

export const adminPreHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (!request.user) {
    await authPreHandler(request, reply);
  }

  if (request.user?.role !== 'admin') {
    throw new ForbiddenError('Access denied: administrator privileges required');
  }
};
