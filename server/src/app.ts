import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
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

export const createApp = async (): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Global Error Handler
  fastify.setErrorHandler(errorHandler);

  // CORS
  await fastify.register(cors, {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // OpenAPI / Swagger Documentation
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'Pending Push API Documentation',
        description: 'High-performance REST API powering the Pending Push publishing platform',
        version: '2.0.0',
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Health and root check
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      success: true,
      message: 'Welcome to Pending Push API (Fastify Engine)',
      docs: '/documentation',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  fastify.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'ok',
      uptime: process.uptime(),
      framework: 'Fastify',
    });
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

  await setupRoutes(fastify, {
    authController,
    postController,
    contactController,
    adminController,
  });

  return fastify;
};
