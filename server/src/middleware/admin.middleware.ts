import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error.js';

export const adminPreHandler = async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
  if (!request.user) {
    throw new UnauthorizedError('User must be authenticated');
  }

  if (request.user.role !== 'admin') {
    throw new ForbiddenError('Access denied: administrator privileges required');
  }
};
