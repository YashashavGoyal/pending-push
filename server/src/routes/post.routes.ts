import { Router } from 'express';
import { PostController } from '../controllers/post.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validators/post.validator.js';

export const createPostRouter = (postController: PostController): Router => {
  const router = Router();

  router.post('/new', authMiddleware, validate(createPostSchema), postController.create);
  router.patch('/:id/edit', authMiddleware, validate(updatePostSchema), postController.update);
  router.delete('/:id/delete', authMiddleware, postController.delete);
  router.get('/read', authMiddleware, postController.getMyPosts);
  router.get('/page/:num', authMiddleware, postController.getFeed);
  router.get('/feed', authMiddleware, postController.getFeed);
  router.get('/slug/:slug', postController.getBySlug);

  return router;
};
