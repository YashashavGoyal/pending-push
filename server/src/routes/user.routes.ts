import { FastifyInstance } from 'fastify';
import { UserController } from '../controllers/user.controller.js';
import { authPreHandler, optionalAuthPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateUserConfigSchema, updateUserProfileSchema } from '../validators/user.validator.js';

export const registerUserRoutes = (fastify: FastifyInstance, userController: UserController): void => {
  fastify.get(
    '/:username',
    {
      preHandler: optionalAuthPreHandler,
      schema: {
        description: 'Get developer public profile with granular privacy checks',
        tags: ['Users & Profile'],
      },
    },
    userController.getProfile
  );

  fastify.get(
    '/me/preferences',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get authenticated user settings and preferences config',
        tags: ['Users & Profile'],
      },
    },
    userController.getPreferences
  );

  fastify.patch(
    '/me/preferences',
    {
      preHandler: [authPreHandler, validateBody(updateUserConfigSchema)],
      schema: {
        description: 'Update privacy toggles, reading preferences, and notifications',
        tags: ['Users & Profile'],
      },
    },
    userController.updatePreferences
  );

  fastify.patch(
    '/me/profile',
    {
      preHandler: [authPreHandler, validateBody(updateUserProfileSchema)],
      schema: {
        description: 'Update user name, bio, and avatar',
        tags: ['Users & Profile'],
      },
    },
    userController.updateProfile
  );
};
