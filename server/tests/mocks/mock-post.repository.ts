import { IPostRepository, CreatePostData, UpdatePostData, FeedFilterQuery } from '../../src/repositories/interfaces/post.repository.interface.js';
import { Post, PostWithAuthor, PostFormat, PaginatedQuery, PaginatedResult } from '../../src/types/index.js';

export class MockPostRepository implements IPostRepository {
  public posts: Map<string, Post> = new Map();

  public async create(data: CreatePostData): Promise<Post> {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const post: Post = {
      id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      summary: data.summary || null,
      coverImage: data.coverImage || null,
      format: data.format || 'article',
      isAnonymous: data.isAnonymous ?? false,
      published: data.published ?? true,
      readingTimeMinutes: data.readingTimeMinutes,
      viewsCount: 0,
      clapsCount: 0,
      authorId: data.authorId,
      config: data.config || {},
      metadata: data.metadata || {},
      publishedAt: data.published ?? true ? now : null,
      createdAt: now,
      updatedAt: now,
    };
    this.posts.set(id, post);
    return post;
  }

  public async findById(id: string): Promise<Post | null> {
    return this.posts.get(id) || null;
  }

  public async findBySlug(slug: string): Promise<PostWithAuthor | null> {
    for (const p of this.posts.values()) {
      if (p.slug === slug) {
        const author = p.isAnonymous
          ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
          : { id: p.authorId, username: 'Author', name: 'Author Name', avatarUrl: null };

        return {
          ...p,
          author,
        };
      }
    }
    return null;
  }

  public async findFeed(query?: FeedFilterQuery): Promise<PaginatedResult<PostWithAuthor>> {
    let items = Array.from(this.posts.values()).filter((p) => p.published);

    if (query?.format) {
      items = items.filter((p) => p.format === query.format);
    }
    if (query?.authorId) {
      items = items.filter((p) => p.authorId === query.authorId);
    }

    const mapped = items.map((p) => {
      const author = p.isAnonymous
        ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
        : { id: p.authorId, username: 'Author', name: 'Author Name', avatarUrl: null };

      return {
        ...p,
        author,
      };
    });

    return { items: mapped, hasMore: false, nextCursor: null };
  }

  public async findByAuthorId(authorId: string): Promise<PaginatedResult<Post>> {
    const items = Array.from(this.posts.values()).filter((p) => p.authorId === authorId);
    return { items, hasMore: false, nextCursor: null };
  }

  public async getRandomPost(format?: PostFormat): Promise<PostWithAuthor | null> {
    let items = Array.from(this.posts.values()).filter((p) => p.published);
    if (format) {
      items = items.filter((p) => p.format === format);
    }
    if (items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * items.length);
    const p = items[randomIndex];

    const author = p.isAnonymous
      ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
      : { id: p.authorId, username: 'Author', name: 'Author Name', avatarUrl: null };

    return {
      ...p,
      author,
    };
  }

  public async incrementViews(id: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.viewsCount += 1;
      this.posts.set(id, post);
    }
  }

  public async update(id: string, data: UpdatePostData): Promise<Post | null> {
    const post = this.posts.get(id);
    if (!post) return null;
    const updated = { ...post, ...data, updatedAt: new Date() };
    this.posts.set(id, updated);
    return updated;
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }
}
