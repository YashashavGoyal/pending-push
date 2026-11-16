import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';

describe('Post & Spaces HTTP Endpoints', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let mockPostRepo: MockPostRepository;
  let authToken: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    mockPostRepo = new MockPostRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: new MockSessionRepository(),
      postRepository: mockPostRepo,
      contactRepository: new MockContactRepository(),
    });

    await app.ready();

    // Register user to get JWT token
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        username: 'writer',
        email: 'writer@example.com',
        password: 'password123',
      },
    });

    authToken = JSON.parse(regRes.body).accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/posts/new', () => {
    it('should create an article post in the articles space', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/posts/new',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Deep Dive into V8 Engine Optimizations',
          content: 'An extensive technical article exploring JIT compilation and hidden classes in V8.',
          format: 'article',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.post.title).toBe('Deep Dive into V8 Engine Optimizations');
      expect(body.post.format).toBe('article');
      expect(body.post.slug).toBeDefined();
    });

    it('should create an anonymous confession in the confessions space', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/posts/new',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Confession from a Senior Lead',
          content: 'I still copy regex patterns from StackOverflow and pretend I wrote them.',
          format: 'confession',
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.post.format).toBe('confession');
      expect(body.post.isAnonymous).toBe(true);
    });
  });

  describe('GET /api/v1/posts/spaces/:space', () => {
    it('should fetch posts for a dedicated space', async () => {
      // Create a dev-log
      await app.inject({
        method: 'POST',
        url: '/api/v1/posts/new',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'RFC-042: Database Sharding Strategy',
          content: 'RFC discussing horizontal sharding across 4 Postgres instances.',
          format: 'dev_log',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/posts/spaces/dev-logs',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.space).toBe('dev-logs');
      expect(body.format).toBe('dev_log');
      expect(body.posts.length).toBeGreaterThanOrEqual(1);
      expect(body.posts[0].title).toBe('RFC-042: Database Sharding Strategy');
    });
  });

  describe('GET /api/v1/posts/random', () => {
    it('should return a random post for the Surprise Me reader', async () => {
      // Seed a post
      await app.inject({
        method: 'POST',
        url: '/api/v1/posts/new',
        headers: {
          authorization: `Bearer ${authToken}`,
        },
        payload: {
          title: 'Serendipity in Software Engineering',
          content: 'Reflections on unexpected bug discoveries that led to breakthroughs.',
          format: 'article',
        },
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/posts/random',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.post).toBeDefined();
      expect(body.post.title).toBe('Serendipity in Software Engineering');
    });
  });
});
