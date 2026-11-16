import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller.js';
import { PostController } from '../controllers/post.controller.js';
import { ContactController } from '../controllers/contact.controller.js';
import { AdminController } from '../controllers/admin.controller.js';
import { registerAuthRoutes } from './auth.routes.js';
import { registerPostRoutes } from './post.routes.js';
import { registerContactRoutes } from './contact.routes.js';
import { registerAdminRoutes } from './admin.routes.js';

export interface RouteControllers {
  authController: AuthController;
  postController: PostController;
  contactController: ContactController;
  adminController: AdminController;
}

export const setupRoutes = async (fastify: FastifyInstance, controllers: RouteControllers): Promise<void> => {
  // Legacy routes for 100% backward compatibility with existing client
  await fastify.register(async (child) => registerAuthRoutes(child, controllers.authController), { prefix: '/api/auth' });
  await fastify.register(async (child) => registerPostRoutes(child, controllers.postController), { prefix: '/api/post' });
  await fastify.register(async (child) => registerContactRoutes(child, controllers.contactController), { prefix: '/api/contact' });
  await fastify.register(async (child) => registerAdminRoutes(child, controllers.adminController), { prefix: '/api/admin' });

  // Modern v1 API routes for future Next.js client
  await fastify.register(async (child) => registerAuthRoutes(child, controllers.authController), { prefix: '/api/v1/auth' });
  await fastify.register(async (child) => registerPostRoutes(child, controllers.postController), { prefix: '/api/v1/posts' });
  await fastify.register(async (child) => registerContactRoutes(child, controllers.contactController), { prefix: '/api/v1/contacts' });
  await fastify.register(async (child) => registerAdminRoutes(child, controllers.adminController), { prefix: '/api/v1/admin' });
};
