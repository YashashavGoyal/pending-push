import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error.js';
import { config } from '../config/env.js';

export const errorMiddleware = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details ? { error: { details: err.details } } : {}),
      // backward compatibility for older frontend if expecting "discription"
      discription: err.message,
    });
    return;
  }

  // Unhandled / system errors
  console.error('Unhandled Server Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(config.nodeEnv === 'development' ? { error: { details: err.message, stack: err.stack } } : {}),
    discription: 'Internal Server Error',
  });
};
