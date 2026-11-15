import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service.js';
import { UnauthorizedError } from '../errors/app-error.js';

export class PostController {
  constructor(private readonly postService: PostService) {}

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const post = await this.postService.createPost(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Post Created Successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const userRole = req.user?.role || 'user';
      const postId = String(req.params.id);

      if (!userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const updated = await this.postService.editPost(postId, userId, userRole, req.body);
      res.status(200).json({
        success: true,
        message: 'Post Updated Successfully',
        post: updated,
        postData: updated,
        userId,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      const userRole = req.user?.role || 'user';
      const postId = String(req.params.id);

      if (!userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      await this.postService.deletePost(postId, userId, userRole);
      res.status(200).json({
        success: true,
        message: 'Post Deleted Successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  public getMyPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new UnauthorizedError('Unauthorized');
      }

      const result = await this.postService.getUserPosts(userId);
      res.status(200).json({
        success: true,
        message: 'Posts Is Refreshed',
        posts: result.items,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      next(error);
    }
  };

  public getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || parseInt(req.params.limit as string, 10) || 10;
      const cursor = (req.query.cursor as string) || undefined;

      const result = await this.postService.getFeed(limit, cursor);
      res.status(200).json({
        success: true,
        message: 'Posts Fetched Successfully',
        posts: result.items,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
      });
    } catch (error) {
      next(error);
    }
  };

  public getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const post = await this.postService.getPostBySlug(String(req.params.slug));
      res.status(200).json({
        success: true,
        message: 'Post Fetched Successfully',
        post,
      });
    } catch (error) {
      next(error);
    }
  };
}
