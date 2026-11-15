import { FastifyInstance } from 'fastify';
import { PostController } from '../controllers/post.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validators/post.validator.js';

export const registerPostRoutes = (fastify: FastifyInstance, postController: PostController): void => {
  fastify.post(
    '/new',
    {
      preHandler: [authPreHandler, validateBody(createPostSchema)],
      schema: {
        description: 'Create a new blog post',
        tags: ['Posts'],
      },
    },
    postController.create
  );

  fastify.patch(
    '/:id/edit',
    {
      preHandler: [authPreHandler, validateBody(updatePostSchema)],
      schema: {
        description: 'Edit an existing blog post',
        tags: ['Posts'],
      },
    },
    postController.update
  );

  fastify.delete(
    '/:id/delete',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Delete a blog post',
        tags: ['Posts'],
      },
    },
    postController.delete
  );

  fastify.get(
    '/read',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get all posts by authenticated user',
        tags: ['Posts'],
      },
    },
    postController.getMyPosts
  );

  fastify.get(
    '/page/:num',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get paginated feed of posts',
        tags: ['Posts'],
      },
    },
    postController.getFeed
  );

  fastify.get(
    '/feed',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get blog post feed',
        tags: ['Posts'],
      },
    },
    postController.getFeed
  );

  fastify.get(
    '/slug/:slug',
    {
      schema: {
        description: 'Get single post by SEO slug',
        tags: ['Posts'],
      },
    },
    postController.getBySlug
  );
};
