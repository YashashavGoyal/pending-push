import { FastifyInstance } from 'fastify';
import { PostController } from '../controllers/post.controller.js';
import { authPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validators/post.validator.js';

export const registerPostRoutes = (fastify: FastifyInstance, postController: PostController): void => {
  // Author Drafts (Placed before parametric routes)
  fastify.get(
    '/drafts',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get all draft posts for authenticated author',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.getDrafts
  );

  fastify.post(
    '/new',
    {
      preHandler: [authPreHandler, validateBody(createPostSchema)],
      schema: {
        description: 'Create a new blog post or draft',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.create
  );

  fastify.post(
    '/',
    {
      preHandler: [authPreHandler, validateBody(createPostSchema)],
      schema: {
        description: 'Create a new blog post or draft (RESTful)',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.create
  );

  fastify.post(
    '/:id/publish',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Publish an existing draft post',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.publish
  );

  fastify.post(
    '/:id/unpublish',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Unpublish a post back to draft',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.unpublish
  );

  fastify.get(
    '/:id/edit',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Fetch post/draft for author studio editing',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.getForEdit
  );

  fastify.put(
    '/:id',
    {
      preHandler: [authPreHandler, validateBody(updatePostSchema)],
      schema: {
        description: 'Update an existing blog post or draft (RESTful PUT)',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.update
  );

  fastify.patch(
    '/:id',
    {
      preHandler: [authPreHandler, validateBody(updatePostSchema)],
      schema: {
        description: 'Update an existing blog post or draft (RESTful PATCH)',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.update
  );

  fastify.patch(
    '/:id/edit',
    {
      preHandler: [authPreHandler, validateBody(updatePostSchema)],
      schema: {
        description: 'Edit an existing blog post (legacy)',
        tags: ['Posts'],
      },
    },
    postController.update
  );

  fastify.delete(
    '/:id',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Delete a blog post (RESTful)',
        tags: ['Posts', 'Author Studio'],
      },
    },
    postController.delete
  );

  fastify.delete(
    '/:id/delete',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Delete a blog post (legacy)',
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
      schema: {
        description: 'Get blog post feed (optional ?format=article|dev_log|tutorial|confession)',
        tags: ['Posts'],
      },
    },
    postController.getFeed
  );

  fastify.get(
    '/',
    {
      schema: {
        description: 'Get platform post feed with format filters',
        tags: ['Posts'],
      },
    },
    postController.getFeed
  );

  fastify.get(
    '/spaces/:space',
    {
      schema: {
        description: 'Get dedicated space feed (articles, dev-logs, tutorials, confessions)',
        tags: ['Posts', 'Spaces'],
      },
    },
    postController.getSpaceFeed
  );

  fastify.get(
    '/random',
    {
      schema: {
        description: 'Get a random post for the Surprise Me reader',
        tags: ['Posts'],
      },
    },
    postController.getRandom
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
