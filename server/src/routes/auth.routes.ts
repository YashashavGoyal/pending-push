import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export const registerAuthRoutes = (fastify: FastifyInstance, authController: AuthController): void => {
  fastify.post(
    '/register',
    {
      preHandler: validateBody(registerSchema),
      schema: {
        description: 'Register a new user account',
        tags: ['Authentication'],
      },
    },
    authController.register
  );

  fastify.post(
    '/login',
    {
      preHandler: validateBody(loginSchema),
      schema: {
        description: 'Login with email and password',
        tags: ['Authentication'],
      },
    },
    authController.login
  );

  fastify.get(
    '/user/info',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get current user profile',
        tags: ['Authentication'],
      },
    },
    authController.getMe
  );
};
