import { ClapResult, CommentItem, PostWithAuthor, UserPublicProfile, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
}

export interface IInteractionRepository {
  // Claps
  clap(postId: string, userId: string, increment?: number): Promise<ClapResult>;
  getUserClaps(postId: string, userId: string): Promise<number>;

  // Bookmarks
  toggleBookmark(postId: string, userId: string): Promise<boolean>;
  isBookmarked(postId: string, userId: string): Promise<boolean>;
  getUserBookmarks(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>>;

  // Follows
  toggleFollow(followerId: string, followingId: string): Promise<boolean>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>>;
  getFollowing(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<UserPublicProfile>>;
  getFollowingFeed(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>>;

  // Comments
  createComment(data: CreateCommentData): Promise<CommentItem>;
  getCommentsByPostId(postId: string): Promise<CommentItem[]>;
  deleteComment(commentId: string, authorId: string, isAdmin?: boolean): Promise<boolean>;
}
