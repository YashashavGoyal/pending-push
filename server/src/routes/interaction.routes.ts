import { FastifyInstance } from 'fastify';
import { InteractionController } from '../controllers/interaction.controller.js';
import { authPreHandler, optionalAuthPreHandler } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { clapSchema, createCommentSchema } from '../validators/interaction.validator.js';

export const registerInteractionRoutes = (
  fastify: FastifyInstance,
  controller: InteractionController
): void => {
  // Claps
  fastify.post(
    '/posts/:id/clap',
    {
      preHandler: [authPreHandler, validateBody(clapSchema)],
      schema: {
        description: 'Clap on a post (Medium-style, up to 50 claps per user)',
        tags: ['Interactions & Social'],
      },
    },
    controller.clap
  );

  fastify.get(
    '/posts/:id/clap',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get authenticated user claps on this post',
        tags: ['Interactions & Social'],
      },
    },
    controller.getUserClaps
  );

  // Bookmarks
  fastify.post(
    '/posts/:id/bookmark',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Toggle bookmark / save story for authenticated user',
        tags: ['Interactions & Social'],
      },
    },
    controller.toggleBookmark
  );

  fastify.get(
    '/bookmarks',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get authenticated user reading list bookmarks',
        tags: ['Interactions & Social'],
      },
    },
    controller.getMyBookmarks
  );

  fastify.get(
    '/users/:id/bookmarks',
    {
      preHandler: optionalAuthPreHandler,
      schema: {
        description: 'Get public reading list for user (if permitted by privacy settings)',
        tags: ['Interactions & Social'],
      },
    },
    controller.getUserBookmarks
  );

  // Follows
  fastify.post(
    '/users/:id/follow',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Follow or unfollow an author',
        tags: ['Interactions & Social'],
      },
    },
    controller.toggleFollow
  );

  fastify.get(
    '/users/:id/followers',
    {
      preHandler: optionalAuthPreHandler,
      schema: {
        description: 'Get followers for an author (privacy-aware)',
        tags: ['Interactions & Social'],
      },
    },
    controller.getFollowers
  );

  fastify.get(
    '/users/:id/following',
    {
      preHandler: optionalAuthPreHandler,
      schema: {
        description: 'Get following list for an author (privacy-aware)',
        tags: ['Interactions & Social'],
      },
    },
    controller.getFollowing
  );

  fastify.get(
    '/posts/feed/following',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Get personalized story feed from authors the user follows',
        tags: ['Interactions & Social'],
      },
    },
    controller.getFollowingFeed
  );

  // Comments
  fastify.post(
    '/posts/:id/comments',
    {
      preHandler: [authPreHandler, validateBody(createCommentSchema)],
      schema: {
        description: 'Add comment or nested reply to a post',
        tags: ['Interactions & Social'],
      },
    },
    controller.addComment
  );

  fastify.get(
    '/posts/:id/comments',
    {
      schema: {
        description: 'Get hierarchical threaded comments for a post',
        tags: ['Interactions & Social'],
      },
    },
    controller.getComments
  );

  fastify.delete(
    '/comments/:id',
    {
      preHandler: authPreHandler,
      schema: {
        description: 'Delete a comment (author or admin)',
        tags: ['Interactions & Social'],
      },
    },
    controller.deleteComment
  );
};
