import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { setupRoutes } from './routes/index.js';
import { IUserRepository } from './repositories/interfaces/user.repository.interface.js';
import { ISessionRepository } from './repositories/interfaces/session.repository.interface.js';
import { IPostRepository } from './repositories/interfaces/post.repository.interface.js';
import { IContactRepository } from './repositories/interfaces/contact.repository.interface.js';
import { IInteractionRepository } from './repositories/interfaces/interaction.repository.interface.js';
import { IAnalyticsRepository } from './repositories/interfaces/analytics.repository.interface.js';
import { UserDrizzleRepository } from './repositories/drizzle/user.drizzle.repository.js';
import { SessionDrizzleRepository } from './repositories/drizzle/session.drizzle.repository.js';
import { PostDrizzleRepository } from './repositories/drizzle/post.drizzle.repository.js';
import { ContactDrizzleRepository } from './repositories/drizzle/contact.drizzle.repository.js';
import { InteractionDrizzleRepository } from './repositories/drizzle/interaction.drizzle.repository.js';
import { AnalyticsDrizzleRepository } from './repositories/drizzle/analytics.drizzle.repository.js';
import { AuthService } from './services/auth.service.js';
import { PostService } from './services/post.service.js';
import { ContactService } from './services/contact.service.js';
import { AdminService } from './services/admin.service.js';
import { UserService } from './services/user.service.js';
import { InteractionService } from './services/interaction.service.js';
import { AnalyticsService } from './services/analytics.service.js';
import { AuthController } from './controllers/auth.controller.js';
import { PostController } from './controllers/post.controller.js';
import { ContactController } from './controllers/contact.controller.js';
import { AdminController } from './controllers/admin.controller.js';
import { UserController } from './controllers/user.controller.js';
import { InteractionController } from './controllers/interaction.controller.js';
import { AnalyticsController } from './controllers/analytics.controller.js';

export interface AppDependencies {
  userRepository?: IUserRepository;
  sessionRepository?: ISessionRepository;
  postRepository?: IPostRepository;
  contactRepository?: IContactRepository;
  interactionRepository?: IInteractionRepository;
  analyticsRepository?: IAnalyticsRepository;
}

export const createApp = async (dependencies?: AppDependencies): Promise<FastifyInstance> => {
  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'development' ? 'info' : 'warn',
    },
  });

  // Global Error Handler
  fastify.setErrorHandler(errorHandler);

  // Security Headers (OWASP Recommended)
  await fastify.register(helmet, {
    contentSecurityPolicy: false, // Prevents breaking Swagger UI inline scripts & external assets
    crossOriginResourcePolicy: false,
  });

  // CORS
  await fastify.register(cors, {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Rate Limiting (Anti-abuse & Credential Stuffing Protection)
  await fastify.register(rateLimit, {
    global: true,
    max: 100, // 100 req/min general limit
    timeWindow: '1 minute',
    allowList: () => config.nodeEnv === 'test',
  });

  // Cookies (HttpOnly session tokens)
  await fastify.register(cookie, {
    secret: config.jwtSecret,
    hook: 'onRequest',
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
  const userRepository = dependencies?.userRepository || new UserDrizzleRepository();
  const sessionRepository = dependencies?.sessionRepository || new SessionDrizzleRepository();
  const postRepository = dependencies?.postRepository || new PostDrizzleRepository();
  const contactRepository = dependencies?.contactRepository || new ContactDrizzleRepository();
  const interactionRepository = dependencies?.interactionRepository || new InteractionDrizzleRepository();
  const analyticsRepository = dependencies?.analyticsRepository || new AnalyticsDrizzleRepository();

  const authService = new AuthService(userRepository, sessionRepository);
  const postService = new PostService(postRepository);
  const contactService = new ContactService(contactRepository);
  const adminService = new AdminService(userRepository, postRepository, contactRepository);
  const userService = new UserService(userRepository);
  const interactionService = new InteractionService(interactionRepository, postRepository, userRepository);
  const analyticsService = new AnalyticsService(analyticsRepository, userRepository);

  const authController = new AuthController(authService);
  const postController = new PostController(postService);
  const contactController = new ContactController(contactService);
  const adminController = new AdminController(authService, adminService);
  const userController = new UserController(userService);
  const interactionController = new InteractionController(interactionService);
  const analyticsController = new AnalyticsController(analyticsService);

  await setupRoutes(fastify, {
    authController,
    postController,
    contactController,
    adminController,
    userController,
    interactionController,
    analyticsController,
  });

  return fastify;
};
