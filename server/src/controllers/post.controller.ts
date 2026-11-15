import { FastifyRequest, FastifyReply } from 'fastify';
import { PostService } from '../services/post.service.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { CreatePostInput, UpdatePostInput } from '../validators/post.validator.js';

export class PostController {
  constructor(private readonly postService: PostService) {}

  public create = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = request.body as CreatePostInput;
    const post = await this.postService.createPost(userId, body);
    reply.status(201).send({
      success: true,
      message: 'Post Created Successfully',
      post,
    });
  };

  public update = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    const params = request.params as { id: string };
    const postId = params.id;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const body = request.body as UpdatePostInput;
    const updated = await this.postService.editPost(postId, userId, userRole, body);
    reply.status(200).send({
      success: true,
      message: 'Post Updated Successfully',
      post: updated,
      postData: updated,
      userId,
    });
  };

  public delete = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    const params = request.params as { id: string };
    const postId = params.id;

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    await this.postService.deletePost(postId, userId, userRole);
    reply.status(200).send({
      success: true,
      message: 'Post Deleted Successfully',
    });
  };

  public getMyPosts = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const result = await this.postService.getUserPosts(userId);
    reply.status(200).send({
      success: true,
      message: 'Posts Is Refreshed',
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getFeed = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { limit?: string; cursor?: string };
    const params = request.params as { num?: string };

    const limit = parseInt(query.limit || params.num || '10', 10);
    const cursor = query.cursor;

    const result = await this.postService.getFeed(limit, cursor);
    reply.status(200).send({
      success: true,
      message: 'Posts Fetched Successfully',
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getBySlug = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { slug: string };
    const post = await this.postService.getPostBySlug(params.slug);
    reply.status(200).send({
      success: true,
      message: 'Post Fetched Successfully',
      post,
    });
  };
}
