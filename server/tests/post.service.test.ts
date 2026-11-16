import { describe, it, expect, beforeEach } from 'vitest';
import { PostService } from '../src/services/post.service.js';
import { MockPostRepository } from './mocks/mock-post.repository.js';
import { CreatePostInput } from '../src/validators/post.validator.js';

describe('PostService & Publishing Spaces', () => {
  let postService: PostService;
  let mockPostRepo: MockPostRepository;

  beforeEach(() => {
    mockPostRepo = new MockPostRepository();
    postService = new PostService(mockPostRepo);
  });

  describe('Post Creation & Formatting', () => {
    it('should create an article with automatically calculated reading time and slug', async () => {
      const input: CreatePostInput = {
        title: 'Building Resilient Distributed Systems in 2026',
        content: 'This is a detailed technical article discussing architecture patterns, consensus, and event streaming across distributed clusters. '.repeat(15),
        summary: 'A complete overview of modern distributed systems.',
        format: 'article',
      };

      const post = await postService.createPost('user-1', input);

      expect(post).toBeDefined();
      expect(post.title).toBe(input.title);
      expect(post.format).toBe('article');
      expect(post.isAnonymous).toBe(false);
      expect(post.slug).toMatch(/^building-resilient-distributed-systems-in-2026-[a-z0-9]+$/);
      expect(post.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    });

    it('should automatically mark confessions as anonymous', async () => {
      const input: CreatePostInput = {
        title: 'I accidentally dropped our production database at 3 AM',
        content: 'It was a cold Friday night. I ran DROP TABLE in the wrong terminal tab. Here is how our team recovered.',
        format: 'confession',
      };

      const post = await postService.createPost('user-1', input);

      expect(post.format).toBe('confession');
      expect(post.isAnonymous).toBe(true);

      // Verify that when fetched by slug, author profile is masked
      const fetched = await postService.getPostBySlug(post.slug);
      expect(fetched.author?.username).toBe('Anonymous Developer');
      expect(fetched.author?.id).toBe('anonymous');
    });

    it('should preserve author profile for standard articles and dev logs', async () => {
      const input: CreatePostInput = {
        title: 'Rust vs Go: Memory Safety Benchmarks',
        content: 'Comparing memory footprints and GC pauses in high-throughput microservices.',
        format: 'dev_log',
      };

      const post = await postService.createPost('user-1', input);
      expect(post.isAnonymous).toBe(false);

      const fetched = await postService.getPostBySlug(post.slug);
      expect(fetched.author?.username).toBe('Author');
      expect(fetched.author?.id).toBe('user-1');
    });
  });

  describe('Dedicated Spaces Feeds', () => {
    beforeEach(async () => {
      // Seed posts in different spaces
      await postService.createPost('user-1', {
        title: 'Article One',
        content: 'Content for article one in the articles space.',
        format: 'article',
      });
      await postService.createPost('user-1', {
        title: 'Dev Log Alpha',
        content: 'Content for dev log alpha documenting internal RFC.',
        format: 'dev_log',
      });
      await postService.createPost('user-2', {
        title: 'Tutorial: Zero to Kubernetes',
        content: 'Step by step instructions for setting up your first cluster.',
        format: 'tutorial',
      });
      await postService.createPost('user-3', {
        title: 'Secret Incident Postmortem',
        content: 'Confession about an uncommitted bug that caused a memory leak.',
        format: 'confession',
      });
    });

    it('should filter posts accurately by space', async () => {
      const articles = await postService.getSpaceFeed('article');
      expect(articles.items).toHaveLength(1);
      expect(articles.items[0].title).toBe('Article One');

      const devLogs = await postService.getSpaceFeed('dev_log');
      expect(devLogs.items).toHaveLength(1);
      expect(devLogs.items[0].title).toBe('Dev Log Alpha');

      const tutorials = await postService.getSpaceFeed('tutorial');
      expect(tutorials.items).toHaveLength(1);
      expect(tutorials.items[0].title).toBe('Tutorial: Zero to Kubernetes');

      const confessions = await postService.getSpaceFeed('confession');
      expect(confessions.items).toHaveLength(1);
      expect(confessions.items[0].author?.username).toBe('Anonymous Developer');
    });

    it('should retrieve a random post for the Surprise Me reader', async () => {
      const random = await postService.getRandomPost();
      expect(random).toBeDefined();
      expect(['Article One', 'Dev Log Alpha', 'Tutorial: Zero to Kubernetes', 'Secret Incident Postmortem']).toContain(random.title);
    });
  });
});
