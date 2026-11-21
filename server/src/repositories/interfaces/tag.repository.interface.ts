import { TagItem, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface ITagRepository {
  findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<TagItem>>;
  findBySlug(slug: string): Promise<TagItem | null>;
  findOrCreateMany(tagNames: string[]): Promise<string[]>;
  syncPostTags(postId: string, tagNames: string[]): Promise<string[]>;
  getTagsForPost(postId: string): Promise<string[]>;
}
