import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { PostController } from '../controllers/post.controller.js';
import { ContactController } from '../controllers/contact.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { UserController } from '../controllers/user.controller.js';
import { InteractionController } from '../controllers/interaction.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { TagController } from '../controllers/tag.controller.js';
import { registerAuthRoutes } from './auth.routes.js';
import { registerPostRoutes } from './post.routes.js';
import { registerContactRoutes } from './contact.routes.js';
import { registerAdminRoutes } from './admin.routes.js';
import { registerUserRoutes } from './user.routes.js';
import { registerInteractionRoutes } from './interaction.routes.js';
import { registerAnalyticsRoutes } from './analytics.routes.js';
import { registerTagRoutes } from './tag.routes.js';

export interface RouteControllers {
  authController: AuthController;
  postController: PostController;
  contactController: ContactController;
  adminController: AdminController;
  userController: UserController;
  interactionController: InteractionController;
  analyticsController: AnalyticsController;
  tagController: TagController;
}

export const setupRoutes = async (fastify: FastifyInstance, controllers: RouteControllers): Promise<void> => {
  // Legacy routes for 100% backward compatibility with existing client
  await fastify.register(async (child) => registerAuthRoutes(child, controllers.authController), { prefix: '/api/auth' });
  await fastify.register(async (child) => registerPostRoutes(child, controllers.postController), { prefix: '/api/post' });
  await fastify.register(async (child) => registerContactRoutes(child, controllers.contactController), { prefix: '/api/contact' });
  await fastify.register(async (child) => registerAdminRoutes(child, controllers.adminController), { prefix: '/api/admin' });
  await fastify.register(async (child) => registerUserRoutes(child, controllers.userController), { prefix: '/api/user' });
  await fastify.register(async (child) => registerInteractionRoutes(child, controllers.interactionController), { prefix: '/api' });
  await fastify.register(async (child) => registerAnalyticsRoutes(child, controllers.analyticsController), { prefix: '/api' });
  await fastify.register(async (child) => registerTagRoutes(child, controllers.tagController), { prefix: '/api/tags' });

  // Modern v1 API routes for future Next.js client
  await fastify.register(async (child) => registerAuthRoutes(child, controllers.authController), { prefix: '/api/v1/auth' });
  await fastify.register(async (child) => registerPostRoutes(child, controllers.postController), { prefix: '/api/v1/posts' });
  await fastify.register(async (child) => registerContactRoutes(child, controllers.contactController), { prefix: '/api/v1/contacts' });
  await fastify.register(async (child) => registerAdminRoutes(child, controllers.adminController), { prefix: '/api/v1/admin' });
  await fastify.register(async (child) => registerUserRoutes(child, controllers.userController), { prefix: '/api/v1/users' });
  await fastify.register(async (child) => registerInteractionRoutes(child, controllers.interactionController), { prefix: '/api/v1' });
  await fastify.register(async (child) => registerAnalyticsRoutes(child, controllers.analyticsController), { prefix: '/api/v1' });
  await fastify.register(async (child) => registerTagRoutes(child, controllers.tagController), { prefix: '/api/v1/tags' });
};
