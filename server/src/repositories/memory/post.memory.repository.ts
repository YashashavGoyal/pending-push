import { IPostRepository, CreatePostData, UpdatePostData } from '../interfaces/post.repository.interface.js';
import { IUserRepository } from '../interfaces/user.repository.interface.js';
import { Post, PostWithAuthor, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class PostMemoryRepository implements IPostRepository {
  private posts: Map<string, Post> = new Map();

  constructor(private readonly userRepository: IUserRepository) {}

  public async create(data: CreatePostData): Promise<Post> {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
    for (const post of this.posts.values()) {
      if (post.slug === slug) {
        return this.attachAuthor(post);
      }
    }
    return null;
  }

  public async findFeed(pagination: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const list = Array.from(this.posts.values())
      .filter((p) => p.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const limit = pagination.limit || 10;
    const items = list.slice(0, limit);
    const withAuthors = await Promise.all(items.map((p) => this.attachAuthor(p)));

    return {
      items: withAuthors,
      hasMore: list.length > limit,
      nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    };
  }

  public async findByAuthorId(authorId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<Post>> {
    const list = Array.from(this.posts.values())
      .filter((p) => p.authorId === authorId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const limit = pagination?.limit || 20;
    const items = list.slice(0, limit);

    return {
      items,
      hasMore: list.length > limit,
      nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    };
  }

  public async update(id: string, data: UpdatePostData): Promise<Post | null> {
    const existing = this.posts.get(id);
    if (!existing) return null;

    const updated: Post = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    this.posts.set(id, updated);
    return updated;
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  private async attachAuthor(post: Post): Promise<PostWithAuthor> {
    const author = await this.userRepository.findById(post.authorId);
    return {
      ...post,
      author: {
        id: post.authorId,
        username: author?.username || 'Unknown Author',
        avatarUrl: author?.avatarUrl || null,
      },
    };
  }
}
