import { randomUUID } from 'node:crypto';
import { IInteractionRepository, CreateCommentData } from '../../src/repositories/interfaces/interaction.repository.interface.js';
import {
  ClapResult,
  CommentItem,
  PostWithAuthor,
  UserPublicProfile,
  PaginatedQuery,
  PaginatedResult,
} from '../../src/types/index.js';
import { BadRequestError } from '../../src/errors/app-error.js';

export class MockInteractionRepository implements IInteractionRepository {
  public claps: Map<string, number> = new Map(); // key: `${postId}:${userId}`
  public postClapSums: Map<string, number> = new Map(); // key: postId
  public bookmarks: Set<string> = new Set(); // item: `${userId}:${postId}`
  public follows: Set<string> = new Set(); // item: `${followerId}:${followingId}`
  public comments: Map<string, CommentItem> = new Map();
  public postsMap: Map<string, PostWithAuthor> = new Map();
  public usersMap: Map<string, UserPublicProfile> = new Map();

  public async clap(postId: string, userId: string, increment = 1): Promise<ClapResult> {
    const key = `${postId}:${userId}`;
    const current = this.claps.get(key) || 0;
    const add = Math.max(1, Math.min(increment, 50));
    const newCount = Math.min(50, current + add);
    const addedActual = newCount - current;

    this.claps.set(key, newCount);

    const total = (this.postClapSums.get(postId) || 0) + addedActual;
    this.postClapSums.set(postId, total);

    return {
      userClaps: newCount,
      totalClaps: total,
    };
  }

  public async getUserClaps(postId: string, userId: string): Promise<number> {
    return this.claps.get(`${postId}:${userId}`) || 0;
  }

  public async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    const key = `${userId}:${postId}`;
    if (this.bookmarks.has(key)) {
      this.bookmarks.delete(key);
      return false;
    }
    this.bookmarks.add(key);
    return true;
  }

  public async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return this.bookmarks.has(`${userId}:${postId}`);
  }

  public async getUserBookmarks(userId: string, _pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const items: PostWithAuthor[] = [];
    for (const key of this.bookmarks) {
      const [uId, pId] = key.split(':');
      if (uId === userId) {
        const post = this.postsMap.get(pId);
        if (post) items.push(post);
      }
    }
    return { items, hasMore: false, nextCursor: null };
  }

  public async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself');
    }
    const key = `${followerId}:${followingId}`;
    if (this.follows.has(key)) {
      this.follows.delete(key);
      return false;
    }
    this.follows.add(key);
    return true;
  }

  public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.follows.has(`${followerId}:${followingId}`);
  }

  public async getFollowers(userId: string, _pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>> {
    const items: UserPublicProfile[] = [];
    for (const key of this.follows) {
      const [fId, targetId] = key.split(':');
      if (targetId === userId) {
        const u = this.usersMap.get(fId);
        if (u) items.push(u);
      }
    }
    return { items, hasMore: false, nextCursor: null };
  }

  public async getFollowing(userId: string, _pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>> {
    const items: UserPublicProfile[] = [];
    for (const key of this.follows) {
      const [fId, targetId] = key.split(':');
      if (fId === userId) {
        const u = this.usersMap.get(targetId);
        if (u) items.push(u);
      }
    }
    return { items, hasMore: false, nextCursor: null };
  }

  public async getFollowingFeed(userId: string, _pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    const followingSet = new Set<string>();
    for (const key of this.follows) {
      const [fId, targetId] = key.split(':');
      if (fId === userId) followingSet.add(targetId);
    }

    const items: PostWithAuthor[] = [];
    for (const post of this.postsMap.values()) {
      if (followingSet.has(post.authorId) && post.published) {
        items.push(post);
      }
    }
    return { items, hasMore: false, nextCursor: null };
  }

  public async createComment(data: CreateCommentData): Promise<CommentItem> {
    const id = randomUUID();
    const now = new Date();
    const authorUser = this.usersMap.get(data.authorId);

    const comment: CommentItem = {
      id,
      postId: data.postId,
      authorId: data.authorId,
      parentId: data.parentId || null,
      content: data.content,
      author: authorUser ? { id: authorUser.id, username: authorUser.username, name: authorUser.name, avatarUrl: authorUser.avatarUrl } : undefined,
      replies: [],
      createdAt: now,
      updatedAt: now,
    };

    this.comments.set(id, comment);
    return comment;
  }

  public async getCommentsByPostId(postId: string): Promise<CommentItem[]> {
    const postComments = Array.from(this.comments.values()).filter((c) => c.postId === postId);
    const commentMap = new Map<string, CommentItem>();
    const roots: CommentItem[] = [];

    for (const c of postComments) {
      commentMap.set(c.id, { ...c, replies: [] });
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
    const comment = this.comments.get(commentId);
    if (!comment) return false;
    if (comment.authorId !== authorId && !isAdmin) return false;

    this.comments.delete(commentId);
    return true;
  }
}
