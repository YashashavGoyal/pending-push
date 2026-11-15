import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error.js';

export const validateBody = (schema: ZodSchema) => {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    try {
      request.body = await schema.parseAsync(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const errorMessage = firstIssue ? `${firstIssue.path.join('.') || 'field'}: ${firstIssue.message}` : 'Validation error';
        throw new ValidationError(errorMessage, error.flatten().fieldErrors);
      }
      throw error;
    }
  };
};
