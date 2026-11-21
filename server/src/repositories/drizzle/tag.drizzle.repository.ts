import { eq, sql, desc, inArray } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tags, postTags } from '../../db/schema/index.js';
import { ITagRepository } from '../interfaces/tag.repository.interface.js';
import { TagItem, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class TagDrizzleRepository implements ITagRepository {
  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<TagItem>> {
    const limit = pagination?.limit || 30;

    const rows = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postsCount: sql<number>`COUNT(${postTags.postId})::int`,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .groupBy(tags.id)
      .orderBy(desc(sql`COUNT(${postTags.postId})`), tags.name)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: items.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        postsCount: Number(r.postsCount || 0),
        createdAt: r.createdAt,
      })),
      hasMore,
      nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    };
  }

  public async findBySlug(slug: string): Promise<TagItem | null> {
    const [row] = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        postsCount: sql<number>`COUNT(${postTags.postId})::int`,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .leftJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(tags.slug, slug.toLowerCase()))
      .groupBy(tags.id)
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      postsCount: Number(row.postsCount || 0),
      createdAt: row.createdAt,
    };
  }

  public async findOrCreateMany(tagNames: string[]): Promise<string[]> {
    if (tagNames.length === 0) return [];

    const cleaned = Array.from(
      new Set(tagNames.map((t) => t.trim()).filter((t) => t.length > 0))
    );

    const tagIds: string[] = [];

    for (const name of cleaned) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const [row] = await db
        .insert(tags)
        .values({ name, slug: slug || name.toLowerCase() })
        .onConflictDoUpdate({
          target: tags.name,
          set: { name },
        })
        .returning({ id: tags.id });

      if (row) {
        tagIds.push(row.id);
      }
    }

    return tagIds;
  }

  public async syncPostTags(postId: string, tagNames: string[]): Promise<string[]> {
    const cleaned = Array.from(
      new Set(tagNames.map((t) => t.trim()).filter((t) => t.length > 0))
    );

    // Delete existing relations
    await db.delete(postTags).where(eq(postTags.postId, postId));

    if (cleaned.length === 0) {
      return [];
    }

    const tagIds = await this.findOrCreateMany(cleaned);

    for (const tagId of tagIds) {
      await db
        .insert(postTags)
        .values({ postId, tagId })
        .onConflictDoNothing();
    }

    return cleaned;
  }

  public async getTagsForPost(postId: string): Promise<string[]> {
    const rows = await db
      .select({ name: tags.name })
      .from(tags)
      .innerJoin(postTags, eq(tags.id, postTags.tagId))
      .where(eq(postTags.postId, postId))
      .orderBy(tags.name);

    return rows.map((r) => r.name);
  }
}
