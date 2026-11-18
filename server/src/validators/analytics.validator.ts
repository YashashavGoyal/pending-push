import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    required_error: 'Role is required and must be either "user" or "admin"',
  }),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, { message: 'User ID is required' }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type UserIdParamInput = z.infer<typeof userIdParamSchema>;
