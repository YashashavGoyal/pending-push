import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { createApp } from '../src/app.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { MockSessionRepository } from './mocks/mock-session.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockContactRepository } from './mocks/mock-contact.repository.js';
import { MockInteractionRepository } from './mocks/mock-interaction.repository.js';

describe('Interaction HTTP Endpoints (Claps, Bookmarks, Follows, Comments)', () => {
  let app: FastifyInstance;
  let mockUserRepo: MockUserRepository;
  let mockPostRepo: MockPostRepository;
  let mockInteractionRepo: MockInteractionRepository;

  let authorToken: string;
  let readerToken: string;
  let authorId: string;
  let readerId: string;
  let postId: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    mockPostRepo = new MockPostRepository();
    mockInteractionRepo = new MockInteractionRepository();

    app = await createApp({
      userRepository: mockUserRepo,
      sessionRepository: new MockSessionRepository(),
      postRepository: mockPostRepo,
      contactRepository: new MockContactRepository(),
      interactionRepository: mockInteractionRepo,
    });

    await app.ready();

    // Register author
    const regAuthor = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { username: 'techlead', email: 'techlead@example.com', password: 'password123' },
    });
    const authorData = JSON.parse(regAuthor.body);
    authorToken = authorData.accessToken;
    authorId = authorData.userId;
    mockInteractionRepo.usersMap.set(authorId, authorData.user);

    // Register reader
    const regReader = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { username: 'devreader', email: 'devreader@example.com', password: 'password123' },
    });
    const readerData = JSON.parse(regReader.body);
    readerToken = readerData.accessToken;
    readerId = readerData.userId;
    mockInteractionRepo.usersMap.set(readerId, readerData.user);

    // Create post
    const postRes = await app.inject({
      method: 'POST',
      url: '/api/v1/posts/new',
      headers: { authorization: `Bearer ${authorToken}` },
      payload: {
        title: 'Microfrontends at Scale',
        content: 'Comprehensive guide to module federation and independent deployments.',
        format: 'article',
      },
    });
    const postBody = JSON.parse(postRes.body);
    postId = postBody.post.id;
    mockInteractionRepo.postsMap.set(postId, {
      ...postBody.post,
      author: { id: authorId, username: 'techlead' },
    });
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/v1/posts/:id/clap', () => {
    it('should allow user to clap on a post', async () => {
      const response = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${postId}/clap`,
        headers: { authorization: `Bearer ${readerToken}` },
        payload: { increment: 5 },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.userClaps).toBe(5);
      expect(body.totalClaps).toBe(5);
    });
  });

  describe('POST /api/v1/posts/:id/bookmark & GET /api/v1/bookmarks', () => {
    it('should bookmark post and fetch saved reading list', async () => {
      // Bookmark post
      const bmRes = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${postId}/bookmark`,
        headers: { authorization: `Bearer ${readerToken}` },
      });

      expect(bmRes.statusCode).toBe(200);
      const bmBody = JSON.parse(bmRes.body);
      expect(bmBody.bookmarked).toBe(true);

      // Fetch reading list
      const listRes = await app.inject({
        method: 'GET',
        url: '/api/v1/bookmarks',
        headers: { authorization: `Bearer ${readerToken}` },
      });

      expect(listRes.statusCode).toBe(200);
      const listBody = JSON.parse(listRes.body);
      expect(listBody.bookmarks).toHaveLength(1);
      expect(listBody.bookmarks[0].title).toBe('Microfrontends at Scale');
    });
  });

  describe('POST /api/v1/users/:id/follow & GET /api/v1/posts/feed/following', () => {
    it('should follow author and access personalized following feed', async () => {
      const followRes = await app.inject({
        method: 'POST',
        url: `/api/v1/users/${authorId}/follow`,
        headers: { authorization: `Bearer ${readerToken}` },
      });

      expect(followRes.statusCode).toBe(200);
      const followBody = JSON.parse(followRes.body);
      expect(followBody.following).toBe(true);

      // Fetch following feed
      const feedRes = await app.inject({
        method: 'GET',
        url: '/api/v1/posts/feed/following',
        headers: { authorization: `Bearer ${readerToken}` },
      });

      expect(feedRes.statusCode).toBe(200);
      const feedBody = JSON.parse(feedRes.body);
      expect(feedBody.posts).toHaveLength(1);
      expect(feedBody.posts[0].authorId).toBe(authorId);
    });
  });

  describe('POST & GET /api/v1/posts/:id/comments', () => {
    it('should post comment and retrieve threaded comments tree', async () => {
      // Reader comments
      const commentRes = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${postId}/comments`,
        headers: { authorization: `Bearer ${readerToken}` },
        payload: { content: 'Is Module Federation ready for enterprise SSR?' },
      });

      expect(commentRes.statusCode).toBe(201);
      const commentBody = JSON.parse(commentRes.body);
      const commentId = commentBody.comment.id;

      // Author replies
      const replyRes = await app.inject({
        method: 'POST',
        url: `/api/v1/posts/${postId}/comments`,
        headers: { authorization: `Bearer ${authorToken}` },
        payload: {
          content: 'Yes! Next.js and Webpack 5 have stable support via NextFederationPlugin.',
          parentId: commentId,
        },
      });
      expect(replyRes.statusCode).toBe(201);

      // Fetch comments tree
      const getCommentsRes = await app.inject({
        method: 'GET',
        url: `/api/v1/posts/${postId}/comments`,
      });

      expect(getCommentsRes.statusCode).toBe(200);
      const getBody = JSON.parse(getCommentsRes.body);
      expect(getBody.comments).toHaveLength(1);
      expect(getBody.comments[0].replies).toHaveLength(1);
      expect(getBody.comments[0].replies[0].content).toContain('NextFederationPlugin');
    });
  });
});
