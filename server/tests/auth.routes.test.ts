import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';

describe('Auth & Session HTTP Endpoints', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let mockSessionRepo: MockSessionRepository;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    mockSessionRepo = new MockSessionRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: mockSessionRepo,
      postRepository: new MockPostRepository(),
      contactRepository: new MockContactRepository(),
    });

    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a user and set the HttpOnly refreshToken cookie', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        },
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);

      expect(body.success).toBe(true);
      expect(body.accessToken).toBeDefined();
      expect(body.user.email).toBe('test@example.com');

      // Verify HttpOnly cookie was set
      const cookies = response.cookies;
      const refreshCookie = cookies.find((c) => c.name === 'refreshToken');
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie?.httpOnly).toBe(true);
      expect(refreshCookie?.sameSite).toBe('Lax');
    });

    it('should fail with 422 if validation fails', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'a', // too short (< 3 chars)
          email: 'not-an-email',
          password: 'short',
        },
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login & /refresh', () => {
    it('should login, receive cookie, and rotate tokens on /refresh', async () => {
      // First register
      await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'tester',
          email: 'tester@example.com',
          password: 'password123',
        },
      });

      // Login
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'tester@example.com',
          password: 'password123',
        },
        headers: {
          'user-agent': 'Chrome on Windows 11',
        },
      });

      expect(loginRes.statusCode).toBe(200);
      const loginBody = JSON.parse(loginRes.body);
      expect(loginBody.accessToken).toBeDefined();

      const refreshCookie = loginRes.cookies.find((c) => c.name === 'refreshToken');
      expect(refreshCookie).toBeDefined();

      // Call /refresh with the cookie
      const refreshRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/refresh',
        cookies: {
          refreshToken: refreshCookie!.value,
        },
      });

      expect(refreshRes.statusCode).toBe(200);
      const refreshBody = JSON.parse(refreshRes.body);
      expect(refreshBody.accessToken).toBeDefined();

      // Ensure rotated cookie was issued
      const newCookie = refreshRes.cookies.find((c) => c.name === 'refreshToken');
      expect(newCookie).toBeDefined();
      expect(newCookie?.value).not.toBe(refreshCookie?.value);
    });
  });

  describe('GET /api/v1/auth/sessions', () => {
    it('should return active sessions for authenticated user', async () => {
      const regRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'sessionuser',
          email: 'session@example.com',
          password: 'password123',
        },
        headers: {
          'user-agent': 'Chrome on Windows 11',
        },
      });

      const { accessToken } = JSON.parse(regRes.body);
      const refreshCookie = regRes.cookies.find((c) => c.name === 'refreshToken');

      const sessionsRes = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/sessions',
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
        cookies: {
          refreshToken: refreshCookie?.value || '',
        },
      });

      expect(sessionsRes.statusCode).toBe(200);
      const sessionsBody = JSON.parse(sessionsRes.body);
      expect(sessionsBody.sessions).toHaveLength(1);
      expect(sessionsBody.sessions[0].isCurrent).toBe(true);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should clear the refreshToken cookie on logout', async () => {
      const regRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'password123',
        },
      });

      const refreshCookie = regRes.cookies.find((c) => c.name === 'refreshToken');

      const logoutRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/logout',
        cookies: {
          refreshToken: refreshCookie?.value || '',
        },
      });

      expect(logoutRes.statusCode).toBe(200);
      const logoutCookie = logoutRes.cookies.find((c) => c.name === 'refreshToken');
      expect(logoutCookie?.value).toBe('');
    });
  });

  describe('Security Headers & Hardening', () => {
    it('should include OWASP security headers on responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});
