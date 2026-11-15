import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../errors/app-error.js';
import { config } from '../config/env.js';

export const errorHandler = (
  error: FastifyError | AppError | Error,
  _request: FastifyRequest,
  reply: FastifyReply
): void => {
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message,
      ...(error.details ? { error: { details: error.details } } : {}),
      discription: error.message,
    });
    return;
  }

  // Fastify internal validation error
  if ('validation' in error && error.validation) {
    reply.status(400).send({
      success: false,
      message: error.message,
      discription: error.message,
    });
    return;
  }

  console.error('Unhandled Fastify Server Error:', error);

  reply.status(500).send({
    success: false,
    message: 'Internal Server Error',
    ...(config.nodeEnv === 'development' ? { error: { details: error.message, stack: error.stack } } : {}),
    discription: 'Internal Server Error',
  });
};
