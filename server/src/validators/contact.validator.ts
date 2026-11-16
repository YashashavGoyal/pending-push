import { z } from 'zod';

export const contactSchema = z.object({
  username: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters' }).optional(),
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .trim()
    .toLowerCase(),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(5, { message: 'Message must be at least 5 characters' })
    .max(2000, { message: 'Message is too long' }),
  user: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
