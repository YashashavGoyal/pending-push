import { FastifyRequest, FastifyReply } from 'fastify';
import { TagService } from '../services/tag.service.js';
import { PostService } from '../services/post.service.js';

export class TagController {
  constructor(
    private readonly tagService: TagService,
    private readonly postService: PostService
  ) {}

  public getTags = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '50', 10);

    const result = await this.tagService.getAllTags(limit, query.cursor);
    reply.status(200).send({
      success: true,
      tags: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };

  public getTag = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { slug: string };
    const tag = await this.tagService.getTagBySlug(params.slug);

    reply.status(200).send({
      success: true,
      tag,
    });
  };

  public getPostsByTag = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const params = request.params as { slug: string };
    const query = request.query as { limit?: string; cursor?: string };
    const limit = parseInt(query.limit || '10', 10);

    const tag = await this.tagService.getTagBySlug(params.slug);
    const result = await this.postService.getFeed({
      tag: tag.slug,
      limit,
      cursor: query.cursor,
    });

    reply.status(200).send({
      success: true,
      tag,
      posts: result.items,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  };
}
