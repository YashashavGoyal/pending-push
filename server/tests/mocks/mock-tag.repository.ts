import { ITagRepository } from '../../src/repositories/interfaces/tag.repository.interface.js';
import { TagItem, PaginatedQuery, PaginatedResult } from '../../src/types/index.js';

export class MockTagRepository implements ITagRepository {
  public tagsMap: Map<string, TagItem> = new Map();
  public postTagsMap: Map<string, Set<string>> = new Map();

  constructor() {
    this.tagsMap.set('fastify', {
      id: 'tag-1',
      name: 'Fastify',
      slug: 'fastify',
      postsCount: 12,
      createdAt: new Date(),
    });
    this.tagsMap.set('nextjs', {
      id: 'tag-2',
      name: 'Next.js',
      slug: 'nextjs',
      postsCount: 8,
      createdAt: new Date(),
    });
    this.tagsMap.set('architecture', {
      id: 'tag-3',
      name: 'Architecture',
      slug: 'architecture',
      postsCount: 15,
      createdAt: new Date(),
    });
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<TagItem>> {
    const limit = pagination?.limit || 50;
    const items = Array.from(this.tagsMap.values()).slice(0, limit);
    return {
      items,
      hasMore: this.tagsMap.size > limit,
      nextCursor: null,
    };
  }

  public async findBySlug(slug: string): Promise<TagItem | null> {
    for (const tag of this.tagsMap.values()) {
      if (tag.slug.toLowerCase() === slug.toLowerCase()) {
        return tag;
      }
    }
    return null;
  }

  public async findOrCreateMany(tagNames: string[]): Promise<string[]> {
    const tagIds: string[] = [];
    for (const name of tagNames) {
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
      let existing = Array.from(this.tagsMap.values()).find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (!existing) {
        existing = {
          id: `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          slug,
          postsCount: 0,
          createdAt: new Date(),
        };
        this.tagsMap.set(slug, existing);
      }
      tagIds.push(existing.id);
    }
    return tagIds;
  }

  public async syncPostTags(postId: string, tagNames: string[]): Promise<string[]> {
    this.postTagsMap.set(postId, new Set(tagNames));
    return tagNames;
  }

  public async getTagsForPost(postId: string): Promise<string[]> {
    return Array.from(this.postTagsMap.get(postId) || []);
  }
}
