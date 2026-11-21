import { Post, PostWithAuthor, PostFormat, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  coverImage?: string | null;
  format?: PostFormat;
  isAnonymous?: boolean;
  published?: boolean;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  readingTimeMinutes: number;
  authorId: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  summary?: string | null;
  coverImage?: string | null;
  format?: PostFormat;
  isAnonymous?: boolean;
  published?: boolean;
  status?: 'draft' | 'published' | 'archived';
  tags?: string[];
  readingTimeMinutes?: number;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface FeedFilterQuery extends PaginatedQuery {
  format?: PostFormat;
  authorId?: string;
  tag?: string;
}

export interface IPostRepository {
  create(data: CreatePostData): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<PostWithAuthor | null>;
  findFeed(query?: FeedFilterQuery): Promise<PaginatedResult<PostWithAuthor>>;
  findByAuthorId(authorId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<Post>>;
  findDraftsByAuthorId(authorId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<Post>>;
  getRandomPost(format?: PostFormat): Promise<PostWithAuthor | null>;
  incrementViews(id: string): Promise<void>;
  update(id: string, data: UpdatePostData): Promise<Post | null>;
  publish(id: string): Promise<Post | null>;
  unpublish(id: string): Promise<Post | null>;
  deleteById(id: string): Promise<boolean>;
}
