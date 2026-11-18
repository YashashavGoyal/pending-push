import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    required_error: 'Role is required and must be either "user" or "admin"',
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
