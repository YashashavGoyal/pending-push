import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { RealtimeService } from '../src/services/realtime.service.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';

describe('Realtime HTTP Endpoints', () => {
  let app: FastifyInstance;
  let authToken: string;
  let userId: string;
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    vi.restoreAllMocks();

    const mockRealtimeService = new RealtimeService({
      url: 'https://omni-socket.example.com',
      appId: 'test_app_id',
      apiKey: 'test_master_key',
    });

    app = await createApp({
      userRepository: new MockUserRepository(),
      sessionRepository: new MockSessionRepository(),
      realtimeService: mockRealtimeService,
    });

    await app.ready();

    // Register user to obtain access token
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        username: 'realtime_user',
        email: 'realtime@example.com',
        password: 'Password123!',
      },
    });

    const data = JSON.parse(res.body);
    authToken = data.accessToken;
    userId = data.userId;
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    await app.close();
  });

  describe('GET /api/v1/realtime/config', () => {
    it('should return public realtime configuration without exposing master apiKey', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/realtime/config',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.data.enabled).toBe(true);
      expect(body.data.serverUrl).toBe('https://omni-socket.example.com');
      expect(body.data.applicationId).toBe('test_app_id');
      expect(body.data.apiKey).toBeUndefined();
    });
  });

  describe('GET /api/v1/realtime/health', () => {
    it('should return 200 with health status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      } as any);

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/realtime/health',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('healthy');
      expect(body.data.latencyMs).toBeDefined();
    });
  });

  describe('GET /api/v1/realtime/token', () => {
    it('should reject unauthenticated requests with 401', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/realtime/token',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return minted client token when authenticated', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          token: 'mock_signed_client_jwt_token',
        }),
      } as any);

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/realtime/token',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.data.token).toBe('mock_signed_client_jwt_token');
      expect(body.data.serverUrl).toBe('https://omni-socket.example.com');
      expect(body.data.applicationId).toBe('test_app_id');
      expect(body.data.userId).toBe(userId);
    });
  });
});
