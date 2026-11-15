import { IPostRepository } from '../repositories/interfaces/post.repository.interface.js';
import { CreatePostInput, UpdatePostInput } from '../validators/post.validator.js';
import { ForbiddenError, NotFoundError } from '../errors/app-error.js';
import { Post, PostWithAuthor, PaginatedResult } from '../types/index.js';

export class PostService {
  constructor(private readonly postRepository: IPostRepository) {}

  public async createPost(authorId: string, input: CreatePostInput): Promise<Post> {
    const slug = this.generateSlug(input.title);
    const readingTimeMinutes = this.calculateReadingTime(input.content);

    return this.postRepository.create({
      title: input.title,
      slug,
      content: input.content,
      summary: input.summary || this.generateSummary(input.content),
      coverImage: input.coverImage || null,
      published: input.published ?? true,
      readingTimeMinutes,
      authorId,
    });
  }

  public async editPost(
    postId: string,
    userId: string,
    userRole: 'user' | 'admin',
    input: UpdatePostInput
  ): Promise<Post> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You are not authorized to edit this post');
    }

    let slug = post.slug;
    if (input.title && input.title !== post.title) {
      slug = this.generateSlug(input.title);
    }

    let readingTimeMinutes = post.readingTimeMinutes;
    if (input.content) {
      readingTimeMinutes = this.calculateReadingTime(input.content);
    }

    const updated = await this.postRepository.update(postId, {
      ...input,
      slug,
      readingTimeMinutes,
    });

    if (!updated) {
      throw new NotFoundError('Post not found during update');
    }

    return updated;
  }

  public async deletePost(postId: string, userId: string, userRole: 'user' | 'admin'): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'admin') {
      throw new ForbiddenError('You are not authorized to delete this post');
    }

    await this.postRepository.deleteById(postId);
  }

  public async getPostBySlug(slug: string): Promise<PostWithAuthor> {
    const post = await this.postRepository.findBySlug(slug);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  public async getPostById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundError('Post not found');
    }
    return post;
  }

  public async getUserPosts(authorId: string, limit = 20, cursor?: string): Promise<PaginatedResult<Post>> {
    return this.postRepository.findByAuthorId(authorId, { limit, cursor });
  }

  public async getFeed(limit = 10, cursor?: string): Promise<PaginatedResult<PostWithAuthor>> {
    return this.postRepository.findFeed({ limit, cursor });
  }

  private calculateReadingTime(text: string): number {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  }

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${randomSuffix}`;
  }

  private generateSummary(content: string): string {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/[#*_`]/g, '').trim();
    return plainText.length > 160 ? `${plainText.substring(0, 157)}...` : plainText;
  }
}
