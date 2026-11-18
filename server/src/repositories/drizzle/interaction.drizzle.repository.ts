import { eq, and, sql, desc, inArray, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { claps, bookmarks, follows, comments, posts, users } from '../../db/schema/index.js';
import { IInteractionRepository, CreateCommentData } from '../interfaces/interaction.repository.interface.js';
import {
  ClapResult,
  CommentItem,
  PostWithAuthor,
  PostFormat,
  UserPublicProfile,
  PaginatedQuery,
  PaginatedResult,
} from '../../types/index.js';
import { BadRequestError } from '../../errors/app-error.js';

export class InteractionDrizzleRepository implements IInteractionRepository {
  // ================= CLAPS =================
  public async clap(postId: string, userId: string, increment = 1): Promise<ClapResult> {
    const inc = Math.max(1, Math.min(increment, 50));

    await db
      .insert(claps)
      .values({
        postId,
        userId,
        count: inc,
      })
      .onConflictDoUpdate({
        target: [claps.postId, claps.userId],
        set: {
          count: sql`LEAST(50, ${claps.count} + ${inc})`,
          updatedAt: new Date(),
        },
      });

    const [userClap] = await db
      .select({ count: claps.count })
      .from(claps)
      .where(and(eq(claps.postId, postId), eq(claps.userId, userId)));

    const [sumResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${claps.count}), 0)` })
      .from(claps)
      .where(eq(claps.postId, postId));

    const totalClaps = Number(sumResult?.total || 0);

    // Synchronize denormalized claps count on posts table
    await db.update(posts).set({ clapsCount: totalClaps }).where(eq(posts.id, postId));

    return {
      userClaps: Number(userClap?.count || 0),
      totalClaps,
    };
  }

  public async getUserClaps(postId: string, userId: string): Promise<number> {
    const [row] = await db
      .select({ count: claps.count })
      .from(claps)
      .where(and(eq(claps.postId, postId), eq(claps.userId, userId)))
      .limit(1);

    return Number(row?.count || 0);
  }

  // ================= BOOKMARKS =================
  public async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .limit(1);

    if (existing) {
      await db
        .delete(bookmarks)
        .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
      return false; // removed
    }

    await db.insert(bookmarks).values({ userId, postId });
    return true; // bookmarked
  }

  public async isBookmarked(postId: string, userId: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
      .limit(1);

    return !!row;
  }

  public async getUserBookmarks(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const limit = pagination?.limit || 10;

    const rows = await db
      .select({
        post: posts,
        author: users,
      })
      .from(bookmarks)
      .innerJoin(posts, eq(bookmarks.postId, posts.id))
      .innerJoin(users, eq(posts.authorId, users.id))
      .where(and(eq(bookmarks.userId, userId), isNull(posts.deletedAt)))
      .orderBy(desc(bookmarks.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const mapped: PostWithAuthor[] = items.map(({ post, author }) => {
      const authorInfo = post.isAnonymous
        ? { id: 'anonymous', username: 'Anonymous Developer', name: 'Anonymous', avatarUrl: null }
        : { id: author.id, username: author.username, name: author.name, avatarUrl: author.avatarUrl };

      let contentString = '';
      if (typeof post.content === 'object' && post.content !== null && 'body' in post.content) {
        contentString = String((post.content as Record<string, unknown>).body);
      } else {
        contentString = post.contentText || '';
      }

      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: contentString,
        summary: post.summary,
        coverImage: post.coverImage,
        format: post.format as PostFormat,
        isAnonymous: post.isAnonymous,
        published: post.status === 'published',
        readingTimeMinutes: post.readingTimeMinutes,
        viewsCount: post.viewsCount,
        clapsCount: post.clapsCount,
        authorId: post.authorId,
        author: authorInfo,
        config: (post.config as Record<string, unknown>) || {},
        metadata: (post.metadata as Record<string, unknown>) || {},
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    });

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  // ================= FOLLOWS =================
  public async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself');
    }

    const [existing] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);

    if (existing) {
      await db
        .delete(follows)
        .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
      return false; // unfollowed
    }

    await db.insert(follows).values({ followerId, followingId });
    return true; // followed
  }

  public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [row] = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)))
      .limit(1);

    return !!row;
  }

  public async getFollowers(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>> {
    const limit = pagination?.limit || 20;

    const rows = await db
      .select({ follower: users })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(and(eq(follows.followingId, userId), isNull(users.deletedAt)))
      .orderBy(desc(follows.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: items.map(({ follower }) => {
        const { passwordHash: _, ...publicProfile } = follower;
        return publicProfile as UserPublicProfile;
      }),
      hasMore,
      nextCursor: items.length > 0 ? items[items.length - 1].follower.id : null,
    };
  }

  public async getFollowing(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>> {
    const limit = pagination?.limit || 20;

    const rows = await db
      .select({ following: users })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(and(eq(follows.followerId, userId), isNull(users.deletedAt)))
      .orderBy(desc(follows.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    return {
      items: items.map(({ following }) => {
        const { passwordHash: _, ...publicProfile } = following;
        return publicProfile as UserPublicProfile;
      }),
      hasMore,
      nextCursor: items.length > 0 ? items[items.length - 1].following.id : null,
    };
  }

  public async getFollowingFeed(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const limit = pagination?.limit || 10;

    // Subquery: users being followed by userId
    const followingRows = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const followingIds = followingRows.map((r) => r.followingId);

    if (followingIds.length === 0) {
      return { items: [], hasMore: false, nextCursor: null };
    }

    const rows = await db.query.posts.findMany({
      where: and(
        inArray(posts.authorId, followingIds),
        eq(posts.status, 'published'),
        isNull(posts.deletedAt)
      ),
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

      let contentString = '';
      if (typeof r.content === 'object' && r.content !== null && 'body' in r.content) {
        contentString = String((r.content as Record<string, unknown>).body);
      } else {
        contentString = r.contentText || '';
      }

      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        content: contentString,
        summary: r.summary,
        coverImage: r.coverImage,
        format: r.format as PostFormat,
        isAnonymous: r.isAnonymous,
        published: r.status === 'published',
        readingTimeMinutes: r.readingTimeMinutes,
        viewsCount: r.viewsCount,
        clapsCount: r.clapsCount,
        authorId: r.authorId,
        author,
        config: (r.config as Record<string, unknown>) || {},
        metadata: (r.metadata as Record<string, unknown>) || {},
        publishedAt: r.publishedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  // ================= COMMENTS =================
  public async createComment(data: CreateCommentData): Promise<CommentItem> {
    const [created] = await db
      .insert(comments)
      .values({
        postId: data.postId,
        authorId: data.authorId,
        parentId: data.parentId || null,
        content: data.content,
      })
      .returning();

    const [author] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, data.authorId))
      .limit(1);

    return {
      id: created.id,
      postId: created.postId,
      authorId: created.authorId,
      parentId: created.parentId,
      content: created.content,
      author,
      replies: [],
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    };
  }

  public async getCommentsByPostId(postId: string): Promise<CommentItem[]> {
    const rows = await db
      .select({
        comment: comments,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          avatarUrl: users.avatarUrl,
        },
      })
      .from(comments)
      .innerJoin(users, eq(comments.authorId, users.id))
      .where(and(eq(comments.postId, postId), isNull(comments.deletedAt)))
      .orderBy(comments.createdAt);

    // Build hierarchical comment tree
    const commentMap = new Map<string, CommentItem>();
    const roots: CommentItem[] = [];

    for (const { comment, author } of rows) {
      const item: CommentItem = {
        id: comment.id,
        postId: comment.postId,
        authorId: comment.authorId,
        parentId: comment.parentId,
        content: comment.content,
        author,
        replies: [],
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      };
      commentMap.set(comment.id, item);
    }

    for (const item of commentMap.values()) {
      if (item.parentId && commentMap.has(item.parentId)) {
        commentMap.get(item.parentId)!.replies!.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  }

  public async deleteComment(commentId: string, authorId: string, isAdmin = false): Promise<boolean> {
    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), isNull(comments.deletedAt)))
      .limit(1);

    if (!comment) return false;
    if (comment.authorId !== authorId && !isAdmin) return false;

    // Soft delete
    const [updated] = await db
      .update(comments)
      .set({ deletedAt: new Date() })
      .where(eq(comments.id, commentId))
      .returning();

    return !!updated;
  }
}
