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

  public getDrafts = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '20', 10);
    const result = await this.postService.getAuthorDrafts(userId, limit, query.cursor);

    reply.status(200).send({
      success: true,
      message: 'Drafts fetched successfully',
      drafts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public publish = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    const params = request.params as { id: string };

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const post = await this.postService.publishPost(params.id, userId, userRole);
    reply.status(200).send({
      success: true,
      message: 'Post Published Successfully',
      post,
    });
  };

  public unpublish = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    const params = request.params as { id: string };

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const post = await this.postService.unpublishPost(params.id, userId, userRole);
    reply.status(200).send({
      success: true,
      message: 'Post Unpublished to Drafts Successfully',
      post,
    });
  };

  public getForEdit = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.userId;
    const userRole = request.user?.role || 'user';
    const params = request.params as { id: string };

    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    const post = await this.postService.getPostForEdit(params.id, userId, userRole);
    reply.status(200).send({
      success: true,
      post,
    });
  };

  public getFeed = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { limit?: string; cursor?: string; format?: string; authorId?: string; tag?: string };
    const params = request.params as { num?: string };

    const limit = parseInt(query.limit || params.num || '10', 10);
    const cursor = query.cursor;
    const format = query.format as any;
    const authorId = query.authorId;
    const tag = query.tag;

    const result = await this.postService.getFeed({ limit, cursor, format, authorId, tag });
    reply.status(200).send({
      success: true,
      message: 'Posts Fetched Successfully',
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getSpaceFeed = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { space: string };
    const query = request.query as { limit?: string; cursor?: string };

    const spaceSlugToFormat: Record<string, 'article' | 'dev_log' | 'tutorial' | 'confession'> = {
      articles: 'article',
      article: 'article',
      'dev-logs': 'dev_log',
      dev_log: 'dev_log',
      tutorials: 'tutorial',
      tutorial: 'tutorial',
      confessions: 'confession',
      confession: 'confession',
    };

    const format = spaceSlugToFormat[params.space];
    const limit = parseInt(query.limit || '10', 10);
    const cursor = query.cursor;

    const result = await this.postService.getSpaceFeed(format || 'article', limit, cursor);
    reply.status(200).send({
      success: true,
      space: params.space,
      format: format || 'article',
      message: `Feed for ${params.space} fetched successfully`,
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getRandom = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { format?: string };
    const format = query.format as any;
    const post = await this.postService.getRandomPost(format);

    reply.status(200).send({
      success: true,
      message: 'Random post selected successfully',
      post,
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
