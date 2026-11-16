import { IPostRepository, CreatePostData, UpdatePostData } from '../../src/repositories/interfaces/post.repository.interface.js';
import { Post, PostWithAuthor, PaginatedQuery, PaginatedResult } from '../../src/types/index.js';

export class MockPostRepository implements IPostRepository {
  public posts: Map<string, Post> = new Map();

  public async create(data: CreatePostData): Promise<Post> {
    const id = `post_${Date.now()}`;
    const now = new Date();
    const post: Post = {
      id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      summary: data.summary || null,
      coverImage: data.coverImage || null,
      published: data.published ?? true,
      readingTimeMinutes: data.readingTimeMinutes,
      authorId: data.authorId,
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
        return {
          ...p,
          author: { id: p.authorId, username: 'Author' },
        };
      }
    }
    return null;
  }

  public async findFeed(pagination: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const items = Array.from(this.posts.values()).map((p) => ({
      ...p,
      author: { id: p.authorId, username: 'Author' },
    }));
    return { items, hasMore: false, nextCursor: null };
  }

  public async findByAuthorId(authorId: string): Promise<PaginatedResult<Post>> {
    const items = Array.from(this.posts.values()).filter((p) => p.authorId === authorId);
    return { items, hasMore: false, nextCursor: null };
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
