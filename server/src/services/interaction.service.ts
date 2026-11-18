import { IInteractionRepository } from '../repositories/interfaces/interaction.repository.interface.js';
import { IPostRepository } from '../repositories/interfaces/post.repository.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/app-error.js';
import {
  ClapResult,
  CommentItem,
  PostWithAuthor,
  UserPublicProfile,
  PaginatedQuery,
  PaginatedResult,
} from '../types/index.js';
import { CreateCommentInput } from '../validators/interaction.validator.js';

export class InteractionService {
  constructor(
    private readonly interactionRepository: IInteractionRepository,
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository
  ) {}

  // ================= CLAPS =================
  public async clapPost(postId: string, userId: string, increment = 1): Promise<ClapResult> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return this.interactionRepository.clap(postId, userId, increment);
  }

  public async getUserClaps(postId: string, userId: string): Promise<number> {
    return this.interactionRepository.getUserClaps(postId, userId);
  }

  // ================= BOOKMARKS =================
  public async toggleBookmark(postId: string, userId: string): Promise<{ bookmarked: boolean }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const bookmarked = await this.interactionRepository.toggleBookmark(postId, userId);
    return { bookmarked };
  }

  public async isBookmarked(postId: string, userId: string): Promise<boolean> {
    return this.interactionRepository.isBookmarked(postId, userId);
  }

  public async getUserBookmarks(
    targetUserId: string,
    requesterUserId?: string,
    pagination?: PaginatedQuery
  ): Promise<PaginatedResult<PostWithAuthor>> {
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isOwner = Boolean(requesterUserId && requesterUserId === targetUserId);

    // Privacy guard: verify if reading list is visible to the requester
    if (!isOwner && !targetUser.config.privacy.showReadingList) {
      throw new ForbiddenError('This user has set their reading list to private');
    }

    return this.interactionRepository.getUserBookmarks(targetUserId, pagination);
  }

  // ================= FOLLOWS =================
  public async toggleFollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestError('You cannot follow yourself');
    }

    const targetUser = await this.userRepository.findById(followingId);
    if (!targetUser) {
      throw new NotFoundError('Target user not found');
    }

    const following = await this.interactionRepository.toggleFollow(followerId, followingId);
    return { following };
  }

  public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.interactionRepository.isFollowing(followerId, followingId);
  }

  public async getFollowers(
    targetUserId: string,
    requesterUserId?: string,
    pagination?: PaginatedQuery
  ): Promise<PaginatedResult<UserPublicProfile>> {
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isOwner = Boolean(requesterUserId && requesterUserId === targetUserId);
    if (!isOwner && !targetUser.config.privacy.showFollowersList) {
      throw new ForbiddenError('This user has set their followers list to private');
    }

    return this.interactionRepository.getFollowers(targetUserId, pagination);
  }

  public async getFollowing(
    targetUserId: string,
    requesterUserId?: string,
    pagination?: PaginatedQuery
  ): Promise<PaginatedResult<UserPublicProfile>> {
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const isOwner = Boolean(requesterUserId && requesterUserId === targetUserId);
    if (!isOwner && !targetUser.config.privacy.showFollowersList) {
      throw new ForbiddenError('This user has set their following list to private');
    }

    return this.interactionRepository.getFollowing(targetUserId, pagination);
  }

  public async getFollowingFeed(userId: string, pagination?: PaginatedQuery): Promise<PaginatedResult<PostWithAuthor>> {
    return this.interactionRepository.getFollowingFeed(userId, pagination);
  }

  // ================= COMMENTS =================
  public async addComment(postId: string, authorId: string, input: CreateCommentInput): Promise<CommentItem> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return this.interactionRepository.createComment({
      postId,
      authorId,
      content: input.content,
      parentId: input.parentId || null,
    });
  }

  public async getComments(postId: string): Promise<CommentItem[]> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    return this.interactionRepository.getCommentsByPostId(postId);
  }

  public async deleteComment(commentId: string, userId: string, userRole: 'user' | 'admin'): Promise<void> {
    const success = await this.interactionRepository.deleteComment(commentId, userId, userRole === 'admin');
    if (!success) {
      throw new NotFoundError('Comment not found or you are not authorized to delete it');
    }
  }
}
