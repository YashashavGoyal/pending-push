import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error.js';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const errorMessage = firstIssue ? `${firstIssue.path.join('.') || 'field'}: ${firstIssue.message}` : 'Validation error';
        next(new ValidationError(errorMessage, error.flatten().fieldErrors));
      } else {
        next(error);
      }
    }
  };
};
