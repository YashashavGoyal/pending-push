import { FastifyRequest, FastifyReply } from 'fastify';
import { InteractionService } from '../services/interaction.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { ClapInput, CreateCommentInput } from '../validators/interaction.validator.js';

export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  // ================= CLAPS =================
  public clap = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const body = (request.body as ClapInput) || { increment: 1 };

    const result = await this.interactionService.clapPost(params.id, userId, body.increment);
    reply.status(200).send({
      success: true,
      message: 'Clap recorded successfully',
      ...result,
    });
  };

  public getUserClaps = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const count = await this.interactionService.getUserClaps(params.id, userId);

    reply.status(200).send({
      success: true,
      userClaps: count,
    });
  };

  // ================= BOOKMARKS =================
  public toggleBookmark = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const { bookmarked } = await this.interactionService.toggleBookmark(params.id, userId);

    reply.status(200).send({
      success: true,
      message: bookmarked ? 'Story saved to bookmarks' : 'Story removed from bookmarks',
      bookmarked,
    });
  };

  public getMyBookmarks = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '10', 10);

    const result = await this.interactionService.getUserBookmarks(userId, userId, {
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      bookmarks: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getUserBookmarks = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const viewerId = request.userId;
    const params = request.params as { id: string };
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '10', 10);

    const result = await this.interactionService.getUserBookmarks(params.id, viewerId, {
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      bookmarks: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  // ================= FOLLOWS =================
  public toggleFollow = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const followerId = request.userId;
    if (!followerId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const { following } = await this.interactionService.toggleFollow(followerId, params.id);

    reply.status(200).send({
      success: true,
      message: following ? 'Author followed successfully' : 'Author unfollowed successfully',
      following,
    });
  };

  public getFollowers = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const viewerId = request.userId;
    const params = request.params as { id: string };
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '20', 10);

    const result = await this.interactionService.getFollowers(params.id, viewerId, {
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      followers: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getFollowing = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const viewerId = request.userId;
    const params = request.params as { id: string };
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '20', 10);

    const result = await this.interactionService.getFollowing(params.id, viewerId, {
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      following: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getFollowingFeed = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '10', 10);

    const result = await this.interactionService.getFollowingFeed(userId, {
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  // ================= COMMENTS =================
  public addComment = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    const body = request.body as CreateCommentInput;

    const comment = await this.interactionService.addComment(params.id, userId, body);
    reply.status(201).send({
      success: true,
      message: 'Comment posted successfully',
      comment,
    });
  };

  public getComments = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { id: string };
    const comments = await this.interactionService.getComments(params.id);

    reply.status(200).send({
      success: true,
      comments,
    });
  };

  public deleteComment = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const params = request.params as { id: string };
    await this.interactionService.deleteComment(params.id, userId, userRole);

    reply.status(200).send({
      success: true,
      message: 'Comment deleted successfully',
    });
  };
}
