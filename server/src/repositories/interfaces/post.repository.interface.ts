import { Post, PostWithAuthor, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  coverImage?: string | null;
  published?: boolean;
  readingTimeMinutes: number;
  authorId: string;
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  summary?: string | null;
  coverImage?: string | null;
  published?: boolean;
  readingTimeMinutes?: number;
}

export interface IPostRepository {
  create(data: CreatePostData): Promise<Post>;
  findById(id: string): Promise<Post | null>;
  findBySlug(slug: string): Promise<PostWithAuthor | null>;
  findFeed(pagination: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>>;
  findByAuthorId(authorId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<Post>>;
  update(id: string, data: UpdatePostData): Promise<Post | null>;
  deleteById(id: string): Promise<boolean>;
}
