import { z } from 'zod';

export const clapSchema = z.object({
  increment: z.number().int().min(1).max(50).optional().default(1),
});

export const createCommentSchema = z.object({
  content: z
    .string({ required_error: 'Comment content is required' })
    .trim()
    .min(1, { message: 'Comment cannot be empty' })
    .max(2000, { message: 'Comment cannot exceed 2000 characters' }),
  parentId: z.string().min(1).optional().nullable(),
});

export type ClapInput = z.infer<typeof clapSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
