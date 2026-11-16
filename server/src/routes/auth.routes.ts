import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

export const registerAuthRoutes = (fastify: FastifyInstance, authController: AuthController): void => {
  fastify.post(
    '/register',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
        },
      },
      preHandler: validateBody(registerSchema),
      schema: {
        description: 'Register a new user account with initial session',
        tags: ['Authentication'],
      },
    },
    authController.register
  );

  fastify.post(
    '/login',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '1 minute',
        },
      },
      preHandler: validateBody(loginSchema),
      schema: {
        description: 'Login with email and password, establishing an active session',
        tags: ['Authentication'],
      },
    },
    authController.login
  );

  fastify.post(
    '/refresh',
    {
      schema: {
        description: 'Refresh Access Token using Refresh Token Rotation (RTR)',
        tags: ['Authentication'],
      },
    },
    authController.refresh
  );

  fastify.post(
    '/logout',
    {
      schema: {
        description: 'Logout and revoke the active refresh token session',
        tags: ['Authentication'],
      },
    },
    authController.logout
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

  fastify.get(
    '/me',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get current user profile (alias)',
        tags: ['Authentication'],
      },
    },
    authController.getMe
  );

  // Active Sessions & Device Management
  fastify.get(
    '/sessions',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'List all active devices and sessions for current user',
        tags: ['Sessions & Security'],
      },
    },
    authController.getSessions
  );

  fastify.delete(
    '/sessions/:id',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Revoke and log out a specific remote device session',
        tags: ['Sessions & Security'],
      },
    },
    authController.revokeSession
  );

  fastify.delete(
    '/sessions/other',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Log out from all other active sessions except the current device',
        tags: ['Sessions & Security'],
      },
    },
    authController.revokeOtherSessions
  );
};
