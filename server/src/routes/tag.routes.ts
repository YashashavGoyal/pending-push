import { FastifyInstance } from 'fastify';
import { TagController } from '../controllers/tag.controller.js';

export const registerTagRoutes = (
  fastify: FastifyInstance,
  controller: TagController
): void => {
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get list of popular tags with story counts',
        tags: ['Tags & Taxonomy'],
      },
    },
    controller.getTags
  );

  fastify.get(
    '/:slug',
    {
      schema: {
        description: 'Get tag details by slug',
        tags: ['Tags & Taxonomy'],
      },
    },
    controller.getTag
  );

  fastify.get(
    '/:slug/posts',
    {
      schema: {
        description: 'Get published stories associated with a specific tag',
        tags: ['Tags & Taxonomy', 'Posts'],
      },
    },
    controller.getPostsByTag
  );
};
