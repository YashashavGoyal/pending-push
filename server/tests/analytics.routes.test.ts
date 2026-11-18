import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';
import { config } from '../src/config/env.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';
import { MockInteractionRepository } from './mocks/mock-interaction.repository.js';
import { MockAnalyticsRepository } from './mocks/mock-analytics.repository.js';

describe('Analytics & Admin HTTP Endpoints', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let mockAnalyticsRepo: MockAnalyticsRepository;

  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let regularUserId: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    mockAnalyticsRepo = new MockAnalyticsRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: new MockSessionRepository(),
      postRepository: new MockPostRepository(),
      contactRepository: new MockContactRepository(),
      interactionRepository: new MockInteractionRepository(),
      analyticsRepository: mockAnalyticsRepo,
    });

    await app.ready();

    // Register test admin user
    const adminUser = await mockUserRepo.create({
      username: 'adminroot',
      email: 'admin@pendingpush.dev',
      passwordHash: 'hash',
      name: 'Admin Root',
      role: 'admin',
    });
    adminId = adminUser.id;
    adminToken = jwt.sign({ userId: adminId, role: 'admin' }, config.jwtSecret, { expiresIn: '1h' });

    // Register regular author user
    const regAuthor = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { username: 'alexrivera', email: 'alex@pendingpush.dev', password: 'password123' },
    });
    const authorData = JSON.parse(regAuthor.body);
    userToken = authorData.accessToken;
    regularUserId = authorData.userId;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /api/v1/users/:username/activity', () => {
    it('should return 365 days of activity heatmap', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/alexrivera/activity',
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.activity.days).toHaveLength(365);
      expect(body.activity.totalContributions).toBeDefined();
    });

    it('should return 404 for unknown username', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/nobody_here/activity',
      });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /api/v1/analytics/author', () => {
    it('should return 401 when not authenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/author',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return author telemetry when authenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/analytics/author',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.telemetry.totalViews).toBe(1250);
      expect(body.telemetry.totalClaps).toBe(340);
      expect(body.telemetry.publishedPushesCount).toBe(8);
      expect(body.telemetry.recentStories).toBeDefined();
    });
  });

  describe('GET /api/v1/admin/stats', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should return 403 when authenticated as a non-admin user', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats',
        headers: { authorization: `Bearer ${userToken}` },
      });

      expect(res.statusCode).toBe(403);
    });

    it('should return platform statistics when authenticated as an admin', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/stats',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.stats.totalUsers).toBe(150);
      expect(body.stats.totalPublishedPosts).toBe(380);
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should return enriched users with postsCount when queried by admin', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/users',
        headers: { authorization: `Bearer ${adminToken}` },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.users).toBeDefined();
      expect(body.users.length).toBeGreaterThan(0);
      expect(body.users[0].postsCount).toBeDefined();
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should update role of a target user', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/admin/users/user-1/role',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: 'admin' },
      });

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.user.role).toBe('admin');
    });

    it('should reject invalid role with 422', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/admin/users/user-1/role',
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: 'superadmin' },
      });

      expect(res.statusCode).toBe(422);
    });

    it('should prevent admin from demoting themselves with 400', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/admin/users/${adminId}/role`,
        headers: { authorization: `Bearer ${adminToken}` },
        payload: { role: 'user' },
      });

      expect(res.statusCode).toBe(400);
    });
  });
});
