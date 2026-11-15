import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { setupRoutes } from './routes/index.js';
import { UserMemoryRepository } from './repositories/memory/user.memory.repository.js';
import { PostMemoryRepository } from './repositories/memory/post.memory.repository.js';
import { ContactMemoryRepository } from './repositories/memory/contact.memory.repository.js';
import { AuthService } from './services/auth.service.js';
import { PostService } from './services/post.service.js';
import { ContactService } from './services/contact.service.js';
import { AdminService } from './services/admin.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { PostController } from './controllers/post.controller.js';
import { ContactController } from './controllers/contact.controller.js';
import { AdminController } from './controllers/admin.controller.js';

export const createApp = (): Application => {
  const app = express();

  // Basic Middlewares
  app.use(express.json());
  app.use(
    cors({
      origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    })
  );

  // Health / welcome endpoints
  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Welcome To Blogs API (v2 Modernized Architecture)',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });

  // Dependency Injection Wiring
  const userRepository = new UserMemoryRepository();
  const postRepository = new PostMemoryRepository(userRepository);
  const contactRepository = new ContactMemoryRepository();

  const authService = new AuthService(userRepository);
  const postService = new PostService(postRepository);
  const contactService = new ContactService(contactRepository);
  const adminService = new AdminService(userRepository, postRepository, contactRepository);

  const authController = new AuthController(authService);
  const postController = new PostController(postService);
  const contactController = new ContactController(contactService);
  const adminController = new AdminController(authService, adminService);

  const apiRouter = setupRoutes({
    authController,
    postController,
    contactController,
    adminController,
  });

  app.use(apiRouter);

  // Centralized Error Handling
  app.use(errorMiddleware);

  return app;
};
