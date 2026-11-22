import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RealtimeService } from '../src/services/realtime.service.js';
import { AppError } from '../src/errors/app-error.js';

describe('RealtimeService Unit Tests', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Configuration & Public Config', () => {
    it('should report configured true when credentials exist', () => {
      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'test_app',
        apiKey: 'test_secret_key',
      });

      expect(service.isConfigured()).toBe(true);
      const publicConfig = service.getPublicConfig();
      expect(publicConfig.enabled).toBe(true);
      expect(publicConfig.serverUrl).toBe('https://omni-socket.example.com');
      expect(publicConfig.applicationId).toBe('test_app');
      expect((publicConfig as any).apiKey).toBeUndefined();
    });

    it('should report configured false when credentials are empty', () => {
      const service = new RealtimeService({
        url: '',
        appId: '',
        apiKey: '',
      });

      expect(service.isConfigured()).toBe(false);
      const publicConfig = service.getPublicConfig();
      expect(publicConfig.enabled).toBe(false);
    });
  });

  describe('Health & Cold-Start Checking', () => {
    it('should return healthy status when /health/live returns 200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      } as any);

      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'app',
        apiKey: 'key',
      });

      const health = await service.checkHealth();
      expect(health.status).toBe('healthy');
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('should report cold-starting when /health/live returns non-200', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      } as any);

      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'app',
        apiKey: 'key',
      });

      const health = await service.checkHealth();
      expect(health.status).toBe('cold-starting');
    });

    it('should report offline when fetch throws network error or times out', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));

      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'app',
        apiKey: 'key',
      });

      const health = await service.checkHealth();
      expect(health.status).toBe('offline');
    });
  });

  describe('Ephemeral Client Token Minting', () => {
    it('should throw 503 if credentials are not configured', async () => {
      const service = new RealtimeService({
        url: '',
        appId: '',
        apiKey: '',
      });

      await expect(service.getClientToken('user_123')).rejects.toThrow(AppError);
    });

    it('should successfully mint token from OmniSocket server', async () => {
      const mockToken = 'mocked_jwt_token_from_omnisocket';
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          status: 'success',
          token: mockToken,
        }),
      } as any);

      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'test_app',
        apiKey: 'test_key',
      });

      const result = await service.getClientToken('user_123', {
        username: 'alice',
        role: 'author',
      });

      expect(result.token).toBe(mockToken);
      expect(result.userId).toBe('user_123');
      expect(result.serverUrl).toBe('https://omni-socket.example.com');
      expect(result.applicationId).toBe('test_app');
      expect(result.expiresInSeconds).toBe(3600);

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://omni-socket.example.com/api/v1/auth/tokens',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-application-id': 'test_app',
            'x-api-key': 'test_key',
          }),
        })
      );
    });

    it('should retry on initial failure to handle Render cold starts', async () => {
      const mockToken = 'retried_jwt_token';
      const mockFetch = vi
        .fn()
        .mockRejectedValueOnce(new Error('AbortError: signal timed out'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ token: mockToken }),
        } as any);

      globalThis.fetch = mockFetch;

      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'test_app',
        apiKey: 'test_key',
      });

      const result = await service.getClientToken('user_retry');
      expect(result.token).toBe(mockToken);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Fail-Safe Event Dispatching', () => {
    it('should safely broadcast to post room without throwing even if disconnected', async () => {
      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'test_app',
        apiKey: 'test_key',
      });

      await expect(
        service.broadcastToPost('post_123', 'post:clap', { count: 5 })
      ).resolves.not.toThrow();
    });

    it('should safely notify user without throwing even if disconnected', async () => {
      const service = new RealtimeService({
        url: 'https://omni-socket.example.com',
        appId: 'test_app',
        apiKey: 'test_key',
      });

      await expect(
        service.notifyUser('user_456', 'user:notification', { text: 'New follower' })
      ).resolves.not.toThrow();
    });
  });
});
