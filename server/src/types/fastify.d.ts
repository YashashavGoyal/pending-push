import { AuthPayload } from './index.js';

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
    user?: AuthPayload;
    token?: string;
  }
}
