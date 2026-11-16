import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/admin.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';
import { adminPreHandler } from '../middleware/admin.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { adminLoginSchema } from '../validators/auth.validator.js';

export const registerAdminRoutes = (fastify: FastifyInstance, adminController: AdminController): void => {
  fastify.post(
    '/login',
    {
      preHandler: validateBody(adminLoginSchema),
      schema: {
        description: 'Admin login',
        tags: ['Admin'],
      },
    },
    adminController.login
  );

  fastify.get(
    '/users',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Get all registered users',
        tags: ['Admin'],
      },
    },
    adminController.getUsers
  );

  fastify.delete(
    '/:id/delete/user',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Delete user by ID',
        tags: ['Admin'],
      },
    },
    adminController.deleteUser
  );

  fastify.get(
    '/:id/posts',
    {
      preHandler: [authPreHandler],
      schema: {
        description: 'Get all posts written by specific user',
        tags: ['Admin'],
      },
    },
    adminController.getUserPosts
  );

  fastify.get(
    '/posts',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Get all platform posts',
        tags: ['Admin'],
      },
    },
    adminController.getPosts
  );

  fastify.get(
    '/contacts',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Get all contact messages',
        tags: ['Admin'],
      },
    },
    adminController.getContacts
  );

  fastify.delete(
    '/:id/delete/msg',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Delete contact message by ID',
        tags: ['Admin'],
      },
    },
    adminController.deleteContact
  );

  fastify.post(
    '/maintenance/cleanup-sessions',
    {
      preHandler: [authPreHandler, adminPreHandler],
      schema: {
        description: 'Prune expired and old revoked sessions',
        tags: ['Admin', 'Maintenance'],
      },
    },
    adminController.cleanupSessions
  );
};
