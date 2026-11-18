import { FastifyInstance } from 'fastify';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { authPreHandler, optionalAuthPreHandler, adminPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { updateUserRoleSchema } from '../validators/analytics.validator.js';

export const registerAnalyticsRoutes = (
  fastify: FastifyInstance,
  controller: AnalyticsController
): void => {
  // Public / Privacy-aware Activity Heatmap
  fastify.get(
    '/users/:username/activity',
    {
      preHandler: optionalAuthPreHandler,
      schema: {
        description: 'Get trailing 52-week activity heatmap and streaks for a user',
        tags: ['Analytics & Activity'],
      },
    },
    controller.getUserActivity
  );

  // Author Studio Readership & Engagement Telemetry
  fastify.get(
    '/analytics/author',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get author studio performance telemetry and story metrics',
        tags: ['Analytics & Activity'],
      },
    },
    controller.getAuthorTelemetry
  );

  // Platform Admin Telemetry & User Management
  fastify.get(
    '/admin/stats',
    {
      preHandler: adminPreHandler,
      schema: {
        description: 'Get high-level platform statistics and totals (Admin only)',
        tags: ['Admin & Moderation'],
      },
    },
    controller.getPlatformStats
  );

  fastify.patch(
    '/admin/users/:id/role',
    {
      preHandler: [adminPreHandler, validateBody(updateUserRoleSchema)],
      schema: {
        description: 'Update a user role between user and admin (Admin only)',
        tags: ['Admin & Moderation'],
      },
    },
    controller.updateUserRole
  );
};
