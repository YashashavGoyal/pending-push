import { z } from 'zod';

export const postFormatEnumSchema = z.enum(['article', 'dev_log', 'tutorial', 'confession']);

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  content: z
    .string({ required_error: 'Content is required' })
    .min(10, { message: 'Content must be at least 10 characters' }),
  summary: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  format: postFormatEnumSchema.optional().default('article'),
  isAnonymous: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
  config: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updatePostSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  format: postFormatEnumSchema.optional(),
  isAnonymous: z.boolean().optional(),
  published: z.boolean().optional(),
  config: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const feedQuerySchema = z.object({
  format: postFormatEnumSchema.optional(),
  authorId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  cursor: z.string().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type FeedQueryInput = z.infer<typeof feedQuerySchema>;
