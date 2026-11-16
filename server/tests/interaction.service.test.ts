import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionService } from '../src/services/interaction.service.js';
import { MockInteractionRepository } from './mocks/mock-interaction.repository.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { BadRequestError, ForbiddenError } from '../src/errors/app-error.js';
import { Post, User } from '../src/types/index.js';

describe('InteractionService (Claps, Bookmarks, Follows, Comments)', () => {
  let interactionService: InteractionService;
  let mockInteractionRepo: MockInteractionRepository;
  let mockPostRepo: MockPostRepository;
  let mockUserRepo: MockUserRepository;

  let authorUser: User;
  let readerUser: User;
  let testPost: Post;

  beforeEach(async () => {
    mockInteractionRepo = new MockInteractionRepository();
    mockPostRepo = new MockPostRepository();
    mockUserRepo = new MockUserRepository();

    interactionService = new InteractionService(mockInteractionRepo, mockPostRepo, mockUserRepo);

    // Create author
    authorUser = await mockUserRepo.create({
      username: 'author',
      email: 'author@example.com',
      passwordHash: 'hash',
    });
    mockInteractionRepo.usersMap.set(authorUser.id, authorUser);

    // Create reader
    readerUser = await mockUserRepo.create({
      username: 'reader',
      email: 'reader@example.com',
      passwordHash: 'hash',
    });
    mockInteractionRepo.usersMap.set(readerUser.id, readerUser);

    // Create post
    testPost = await mockPostRepo.create({
      title: 'High-Scale Node.js Architecture',
      slug: 'high-scale-node-arch',
      content: 'Deep dive into event loop, threadpool and microservices.',
      readingTimeMinutes: 5,
      authorId: authorUser.id,
      published: true,
    });
    mockInteractionRepo.postsMap.set(testPost.id, {
      ...testPost,
      author: { id: authorUser.id, username: authorUser.username },
    });
  });

  describe('Multi-Clap System (Medium-style)', () => {
    it('should increment claps and track total claps', async () => {
      const result1 = await interactionService.clapPost(testPost.id, readerUser.id, 5);
      expect(result1.userClaps).toBe(5);
      expect(result1.totalClaps).toBe(5);

      const result2 = await interactionService.clapPost(testPost.id, readerUser.id, 10);
      expect(result2.userClaps).toBe(15);
      expect(result2.totalClaps).toBe(15);
    });

    it('should cap claps at 50 claps per user per post', async () => {
      // First 40 claps
      await interactionService.clapPost(testPost.id, readerUser.id, 40);

      // Attempt to add 20 more (should cap at 50)
      const result = await interactionService.clapPost(testPost.id, readerUser.id, 20);
      expect(result.userClaps).toBe(50);
      expect(result.totalClaps).toBe(50);

      // Further claps don't exceed 50
      const result3 = await interactionService.clapPost(testPost.id, readerUser.id, 10);
      expect(result3.userClaps).toBe(50);
      expect(result3.totalClaps).toBe(50);
    });
  });

  describe('Bookmarks & Saved Stories', () => {
    it('should toggle bookmark on and off', async () => {
      const res1 = await interactionService.toggleBookmark(testPost.id, readerUser.id);
      expect(res1.bookmarked).toBe(true);

      const isSaved = await interactionService.isBookmarked(testPost.id, readerUser.id);
      expect(isSaved).toBe(true);

      const res2 = await interactionService.toggleBookmark(testPost.id, readerUser.id);
      expect(res2.bookmarked).toBe(false);
    });

    it('should respect reading list privacy toggle', async () => {
      // Reader bookmarks a post
      await interactionService.toggleBookmark(testPost.id, readerUser.id);

      // By default showReadingList is false
      await expect(
        interactionService.getUserBookmarks(readerUser.id, 'another-user-id')
      ).rejects.toThrow(ForbiddenError);

      // But the owner can always see their bookmarks
      const ownerView = await interactionService.getUserBookmarks(readerUser.id, readerUser.id);
      expect(ownerView.items).toHaveLength(1);
      expect(ownerView.items[0].title).toBe('High-Scale Node.js Architecture');
    });
  });

  describe('Follows & Following Feed', () => {
    it('should follow and unfollow an author', async () => {
      const f1 = await interactionService.toggleFollow(readerUser.id, authorUser.id);
      expect(f1.following).toBe(true);

      const isFollowing = await interactionService.isFollowing(readerUser.id, authorUser.id);
      expect(isFollowing).toBe(true);

      const f2 = await interactionService.toggleFollow(readerUser.id, authorUser.id);
      expect(f2.following).toBe(false);
    });

    it('should prevent a user from following themselves', async () => {
      await expect(
        interactionService.toggleFollow(readerUser.id, readerUser.id)
      ).rejects.toThrow(BadRequestError);
    });

    it('should return personalized stories in following feed', async () => {
      // Reader follows author
      await interactionService.toggleFollow(readerUser.id, authorUser.id);

      const feed = await interactionService.getFollowingFeed(readerUser.id);
      expect(feed.items).toHaveLength(1);
      expect(feed.items[0].authorId).toBe(authorUser.id);
    });
  });

  describe('Threaded / Nested Comments', () => {
    it('should add top-level comment and nested reply', async () => {
      const comment1 = await interactionService.addComment(testPost.id, readerUser.id, {
        content: 'Fantastic article! Could you elaborate on memory limits?',
      });
      expect(comment1).toBeDefined();
      expect(comment1.content).toContain('Fantastic article');

      // Author replies to reader's comment
      const reply = await interactionService.addComment(testPost.id, authorUser.id, {
        content: 'Sure! In V8 64-bit, heap limit is typically around 1.4GB by default.',
        parentId: comment1.id,
      });
      expect(reply.parentId).toBe(comment1.id);

      // Fetch comments tree
      const tree = await interactionService.getComments(testPost.id);
      expect(tree).toHaveLength(1); // 1 root comment
      expect(tree[0].id).toBe(comment1.id);
      expect(tree[0].replies).toHaveLength(1); // 1 nested reply
      expect(tree[0].replies![0].id).toBe(reply.id);
    });
  });
});
