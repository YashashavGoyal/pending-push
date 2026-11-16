import { eq, desc, isNull, and, sql } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { posts, users } from '../../db/schema/index.js';
import { IPostRepository, CreatePostData, UpdatePostData, FeedFilterQuery } from '../interfaces/post.repository.interface.js';
import { Post, PostWithAuthor, PostFormat, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class PostDrizzleRepository implements IPostRepository {
  public async create(data: CreatePostData): Promise<Post> {
    const isPublished = data.published ?? true;
    const format = data.format || 'article';
    const isAnonymous = data.isAnonymous ?? false;

    const [created] = await db
      .insert(posts)
      .values({
        authorId: data.authorId,
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: { body: data.content },
        contentText: data.content,
        coverImage: data.coverImage,
        format,
        isAnonymous,
        status: isPublished ? 'published' : 'draft',
        readingTimeMinutes: data.readingTimeMinutes,
        publishedAt: isPublished ? new Date() : null,
        config: data.config || {},
        metadata: data.metadata || {},
      })
      .returning();

    return this.mapToDomain(created);
  }

  public async findById(id: string): Promise<Post | null> {
    const [row] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .limit(1);

    return row ? this.mapToDomain(row) : null;
  }

  public async findBySlug(slug: string): Promise<PostWithAuthor | null> {
    const row = await db.query.posts.findFirst({
      where: and(eq(posts.slug, slug), isNull(posts.deletedAt)),
      with: {
        author: true,
      },
    });

    if (!row) return null;

    const author = row.isAnonymous
      ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
      : { id: row.author.id, username: row.author.username, name: row.author.name, avatarUrl: row.author.avatarUrl };

    return {
      ...this.mapToDomain(row),
      author,
    };
  }

  public async findFeed(query?: FeedFilterQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const limit = query?.limit || 10;
    const conditions = [eq(posts.status, 'published'), isNull(posts.deletedAt)];

    if (query?.format) {
      conditions.push(eq(posts.format, query.format));
    }
    if (query?.authorId) {
      conditions.push(eq(posts.authorId, query.authorId));
    }

    const rows = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [desc(posts.publishedAt)],
      limit: limit + 1,
      with: {
        author: true,
      },
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const mapped: PostWithAuthor[] = items.map((r) => {
      const author = r.isAnonymous
        ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
        : { id: r.author.id, username: r.author.username, name: r.author.name, avatarUrl: r.author.avatarUrl };

      return {
        ...this.mapToDomain(r),
        author,
      };
    });

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  public async findByAuthorId(authorId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<Post>> {
    const limit = pagination?.limit || 20;

    const rows = await db
      .select()
      .from(posts)
      .where(and(eq(posts.authorId, authorId), isNull(posts.deletedAt)))
      .orderBy(desc(posts.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const mapped = items.map((p) => this.mapToDomain(p));

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  public async getRandomPost(format?: PostFormat): Promise<PostWithAuthor | null> {
    const conditions = [eq(posts.status, 'published'), isNull(posts.deletedAt)];
    if (format) {
      conditions.push(eq(posts.format, format));
    }

    const rows = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: [sql`RANDOM()`],
      limit: 1,
      with: {
        author: true,
      },
    });

    if (rows.length === 0) return null;
    const r = rows[0];
    const author = r.isAnonymous
      ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
      : { id: r.author.id, username: r.author.username, name: r.author.name, avatarUrl: r.author.avatarUrl };

    return {
      ...this.mapToDomain(r),
      author,
    };
  }

  public async incrementViews(id: string): Promise<void> {
    await db
      .update(posts)
      .set({ viewsCount: sql`${posts.viewsCount} + 1` })
      .where(eq(posts.id, id));
  }

  public async update(id: string, data: UpdatePostData): Promise<Post | null> {
    const updateValues: Partial<typeof posts.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateValues.title = data.title;
    if (data.slug !== undefined) updateValues.slug = data.slug;
    if (data.summary !== undefined) updateValues.summary = data.summary;
    if (data.coverImage !== undefined) updateValues.coverImage = data.coverImage;
    if (data.format !== undefined) updateValues.format = data.format;
    if (data.isAnonymous !== undefined) updateValues.isAnonymous = data.isAnonymous;
    if (data.readingTimeMinutes !== undefined) updateValues.readingTimeMinutes = data.readingTimeMinutes;
    if (data.config !== undefined) updateValues.config = data.config;
    if (data.metadata !== undefined) updateValues.metadata = data.metadata;
    if (data.content !== undefined) {
      updateValues.content = { body: data.content };
      updateValues.contentText = data.content;
    }
    if (data.published !== undefined) {
      updateValues.status = data.published ? 'published' : 'draft';
      if (data.published) updateValues.publishedAt = new Date();
    }

    const [updated] = await db
      .update(posts)
      .set(updateValues)
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();

    return updated ? this.mapToDomain(updated) : null;
  }

  public async deleteById(id: string): Promise<boolean> {
    // Soft delete
    const [updated] = await db
      .update(posts)
      .set({ deletedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    return !!updated;
  }

  private mapToDomain(row: typeof posts.$inferSelect): Post {
    let contentString = '';
    if (typeof row.content === 'object' && row.content !== null && 'body' in row.content) {
      contentString = String((row.content as Record<string, unknown>).body);
    } else if (typeof row.content === 'string') {
      contentString = row.content;
    } else {
      contentString = row.contentText || JSON.stringify(row.content);
    }

    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      content: contentString,
      summary: row.summary,
      coverImage: row.coverImage,
      format: row.format as PostFormat,
      isAnonymous: row.isAnonymous,
      published: row.status === 'published',
      readingTimeMinutes: row.readingTimeMinutes,
      viewsCount: row.viewsCount,
      clapsCount: row.clapsCount,
      authorId: row.authorId,
      config: (row.config as Record<string, unknown>) || {},
      metadata: (row.metadata as Record<string, unknown>) || {},
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
