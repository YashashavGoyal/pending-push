import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';
import { MockTagRepository } from './mocks/mock-tag.repository.js';

describe('Post & Spaces HTTP Endpoints', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let mockPostRepo: MockPostRepository;
  let mockTagRepo: MockTagRepository;
  let authToken: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    mockPostRepo = new MockPostRepository();
    mockTagRepo = new MockTagRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: new MockSessionRepository(),
      postRepository: mockPostRepo,
      contactRepository: new MockContactRepository(),
      tagRepository: mockTagRepo,
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

  describe('POST /api/v1/posts/new & /api/v1/posts', () => {
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
          tags: ['v8', 'javascript', 'performance'],
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.post.title).toBe('Deep Dive into V8 Engine Optimizations');
      expect(body.post.format).toBe('article');
      expect(body.post.tags).toEqual(['v8', 'javascript', 'performance']);
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

  describe('Author Studio Drafts & Post Lifecycle', () => {
    it('should create, list, edit, publish, and unpublish a draft', async () => {
      // 1. Create a draft via RESTful POST /api/v1/posts
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/posts',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: 'Draft in Progress: WebAssembly Runtime',
          content: 'Exploring WASM runtime memory isolation and speed.',
          published: false,
          tags: ['wasm', 'rust'],
        },
      });

      expect(createRes.statusCode).toBe(201);
      const draft = JSON.parse(createRes.body).post;
      expect(draft.published).toBe(false);

      // 2. Fetch author drafts via GET /api/v1/posts/drafts
      const draftsRes = await app.inject({
        method: 'GET',
        url: '/api/v1/posts/drafts',
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(draftsRes.statusCode).toBe(200);
      const draftsBody = JSON.parse(draftsRes.body);
      expect(draftsBody.drafts).toHaveLength(1);
      expect(draftsBody.drafts[0].id).toBe(draft.id);

      // 3. Fetch draft for editing via GET /api/v1/posts/:id/edit
      const editRes = await app.inject({
        method: 'GET',
        url: `/api/v1/posts/${draft.id}/edit`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(editRes.statusCode).toBe(200);
      expect(JSON.parse(editRes.body).post.id).toBe(draft.id);

      // 4. Update draft via PUT /api/v1/posts/:id
      const updateRes = await app.inject({
        method: 'PUT',
        url: `/api/v1/posts/${draft.id}`,
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: 'Updated: WebAssembly Runtime in 2026',
        },
      });

      expect(updateRes.statusCode).toBe(200);
      expect(JSON.parse(updateRes.body).post.title).toBe('Updated: WebAssembly Runtime in 2026');

      // 5. Publish draft via POST /api/v1/posts/:id/publish
      const pubRes = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${draft.id}/publish`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(pubRes.statusCode).toBe(200);
      expect(JSON.parse(pubRes.body).post.published).toBe(true);

      // 6. Unpublish back to draft via POST /api/v1/posts/:id/unpublish
      const unpubRes = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${draft.id}/unpublish`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(unpubRes.statusCode).toBe(200);
      expect(JSON.parse(unpubRes.body).post.published).toBe(false);

      // 7. Delete draft via DELETE /api/v1/posts/:id
      const delRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/posts/${draft.id}`,
        headers: { authorization: `Bearer ${authToken}` },
      });

      expect(delRes.statusCode).toBe(200);
    });
  });

  describe('Tags & Taxonomy HTTP Endpoints', () => {
    it('should fetch popular tags and posts by tag', async () => {
      // Create a tagged post
      await app.inject({
        method: 'POST',
        url: '/api/v1/posts',
        headers: { authorization: `Bearer ${authToken}` },
        payload: {
          title: 'Fastify High Throughput Architecture',
          content: 'A deep dive into Fastify schemas and routing performance.',
          tags: ['fastify'],
        },
      });

      // GET /api/v1/tags
      const tagsRes = await app.inject({
        method: 'GET',
        url: '/api/v1/tags',
      });

      expect(tagsRes.statusCode).toBe(200);
      const tagsBody = JSON.parse(tagsRes.body);
      expect(tagsBody.tags).toBeDefined();
      expect(tagsBody.tags.length).toBeGreaterThan(0);

      // GET /api/v1/tags/:slug/posts
      const tagPostsRes = await app.inject({
        method: 'GET',
        url: '/api/v1/tags/fastify/posts',
      });

      expect(tagPostsRes.statusCode).toBe(200);
      const tagPostsBody = JSON.parse(tagPostsRes.body);
      expect(tagPostsBody.posts).toBeDefined();
      expect(tagPostsBody.tag.slug).toBe('fastify');
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
