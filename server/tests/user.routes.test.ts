import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';

describe('User Profile & Preferences HTTP Endpoints', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let authToken: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: new MockSessionRepository(),
      postRepository: new MockPostRepository(),
      contactRepository: new MockContactRepository(),
    });

    await app.ready();

    // Register test user
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        username: 'coder',
        email: 'coder@example.com',
        password: 'password123',
      },
    });

    authToken = JSON.parse(regRes.body).accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/users/:username', () => {
    it('should view public profile by default', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/coder',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.profile.username).toBe('coder');
      expect(body.profile.isPrivate).toBe(false);
      expect(body.profile.privacy.showActivityHeatmap).toBe(true);
    });

    it('should show masked private view when profile is private and viewer is unauthenticated', async () => {
      // Toggle private on
      await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          privacy: {
            isPrivate: true,
          },
        },
      });

      // Anonymous visitor requests profile
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/coder',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.profile.isPrivate).toBe(true);
      expect(body.profile.isOwner).toBe(false);
      expect(body.profile.message).toBe('This developer profile is private');
    });

    it('should show full view when the profile owner views their own private profile', async () => {
      // Toggle private on
      await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          privacy: {
            isPrivate: true,
          },
        },
      });

      // Owner requests profile with their Bearer token
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/users/coder',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.profile.isPrivate).toBe(true);
      expect(body.profile.isOwner).toBe(true);
      expect(body.profile.config.privacy.isPrivate).toBe(true);
    });
  });

  describe('PATCH /api/v1/users/me/preferences', () => {
    it('should update appearance and notifications preferences', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          appearance: {
            theme: 'dark',
            fontFamily: 'serif',
          },
          notifications: {
            emailDigest: false,
          },
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.preferences.appearance.theme).toBe('dark');
      expect(body.preferences.appearance.fontFamily).toBe('serif');
      expect(body.preferences.notifications.emailDigest).toBe(false);
      // Untouched codeLigatures remains default true
      expect(body.preferences.appearance.codeLigatures).toBe(true);
    });

    it('should reject updates with extra non-whitelisted fields', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/v1/users/me/preferences',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          appearance: {
            customInjectedProp: 'malicious',
          },
        },
      });

      expect(response.statusCode).toBe(422);
    });
  });
});
