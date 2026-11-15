import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { PostController } from '../controllers/post.controller.js';
import { ContactController } from '../controllers/contact.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { createAuthRouter } from './auth.routes.js';
import { createPostRouter } from './post.routes.js';
import { createContactRouter } from './contact.routes.js';
import { createAdminRouter } from './admin.routes.js';

export interface RouteControllers {
  authController: AuthController;
  postController: PostController;
  contactController: ContactController;
  adminController: AdminController;
}

export const setupRoutes = (controllers: RouteControllers): Router => {
  const router = Router();

  const authRouter = createAuthRouter(controllers.authController);
  const postRouter = createPostRouter(controllers.postController);
  const contactRouter = createContactRouter(controllers.contactController);
  const adminRouter = createAdminRouter(controllers.adminController);

  // Legacy paths
  router.use('/api/auth', authRouter);
  router.use('/api/post', postRouter);
  router.use('/api/contact', contactRouter);
  router.use('/api/admin', adminRouter);

  // Modern v1 API paths
  router.use('/api/v1/auth', authRouter);
  router.use('/api/v1/posts', postRouter);
  router.use('/api/v1/contacts', contactRouter);
  router.use('/api/v1/admin', adminRouter);

  return router;
};
