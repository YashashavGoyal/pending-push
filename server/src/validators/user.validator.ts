import { z } from 'zod';
import { DEFAULT_USER_CONFIG } from '../types/index.js';

export const userPrivacyConfigSchema = z
  .object({
    isPrivate: z.boolean().default(DEFAULT_USER_CONFIG.privacy.isPrivate),
    showActivityHeatmap: z.boolean().default(DEFAULT_USER_CONFIG.privacy.showActivityHeatmap),
    showFollowersList: z.boolean().default(DEFAULT_USER_CONFIG.privacy.showFollowersList),
    showReadingList: z.boolean().default(DEFAULT_USER_CONFIG.privacy.showReadingList),
  })
  .strict();

export const userAppearanceConfigSchema = z
  .object({
    theme: z.enum(['system', 'light', 'dark']).default(DEFAULT_USER_CONFIG.appearance.theme),
    fontFamily: z.enum(['sans', 'serif', 'mono']).default(DEFAULT_USER_CONFIG.appearance.fontFamily),
    codeLigatures: z.boolean().default(DEFAULT_USER_CONFIG.appearance.codeLigatures),
  })
  .strict();

export const userNotificationConfigSchema = z
  .object({
    emailDigest: z.boolean().default(DEFAULT_USER_CONFIG.notifications.emailDigest),
    newFollower: z.boolean().default(DEFAULT_USER_CONFIG.notifications.newFollower),
    newComment: z.boolean().default(DEFAULT_USER_CONFIG.notifications.newComment),
  })
  .strict();

export const userConfigSchema = z
  .object({
    privacy: userPrivacyConfigSchema.default(DEFAULT_USER_CONFIG.privacy),
    appearance: userAppearanceConfigSchema.default(DEFAULT_USER_CONFIG.appearance),
    notifications: userNotificationConfigSchema.default(DEFAULT_USER_CONFIG.notifications),
  })
  .strict();

export const updateUserConfigSchema = z
  .object({
    privacy: userPrivacyConfigSchema.partial().optional(),
    appearance: userAppearanceConfigSchema.partial().optional(),
    notifications: userNotificationConfigSchema.partial().optional(),
  })
  .strict();

export const updateUserProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    bio: z.string().max(300).optional().nullable(),
    avatarUrl: z.string().url().optional().or(z.literal('')).nullable(),
  })
  .strict();

export type UserPrivacyConfigInput = z.infer<typeof userPrivacyConfigSchema>;
export type UserAppearanceConfigInput = z.infer<typeof userAppearanceConfigSchema>;
export type UserNotificationConfigInput = z.infer<typeof userNotificationConfigSchema>;
export type UserConfigInput = z.infer<typeof userConfigSchema>;
export type UpdateUserConfigInput = z.infer<typeof updateUserConfigSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
