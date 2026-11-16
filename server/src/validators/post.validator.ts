import { z } from 'zod';

export const createPostSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(3, { message: 'Title must be at least 3 characters' })
    .max(200, { message: 'Title cannot exceed 200 characters' }),
  content: z
    .string({ required_error: 'Content is required' })
    .min(10, { message: 'Content must be at least 10 characters' }),
  summary: z.string().max(300).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional().default(true),
});

export const updatePostSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  content: z.string().min(10).optional(),
  summary: z.string().max(300).optional(),
  coverImage: z.string().url().optional().or(z.literal('')),
  published: z.boolean().optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
