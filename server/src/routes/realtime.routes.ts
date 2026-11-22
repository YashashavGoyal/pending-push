import { FastifyInstance } from 'fastify';
import { RealtimeController } from '../controllers/realtime.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';

export const registerRealtimeRoutes = (
  fastify: FastifyInstance,
  realtimeController: RealtimeController
): void => {
  fastify.get(
    '/config',
    {
      schema: {
        description: 'Get public realtime connection configuration without master credentials',
        tags: ['Realtime'],
      },
    },
    realtimeController.getConfig
  );

  fastify.get(
    '/health',
    {
      schema: {
        description: 'Check health and cold-start liveness of OmniSocket server',
        tags: ['Realtime'],
      },
    },
    realtimeController.getHealth
  );

  fastify.get(
    '/token',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Mint an ephemeral client connection token for authenticated user',
        tags: ['Realtime'],
      },
    },
    realtimeController.getToken
  );
};
