import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../src/services/user.service.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { DEFAULT_USER_CONFIG } from '../src/types/index.js';
import { ZodError } from 'zod';

describe('UserService & Granular Privacy Management', () => {
  let userService: UserService;
  let mockUserRepo: MockUserRepository;
  let userId: string;

  beforeEach(async () => {
    mockUserRepo = new MockUserRepository();
    userService = new UserService(mockUserRepo);

    const user = await mockUserRepo.create({
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: 'hash123',
    });
    userId = user.id;
  });

  describe('User Preferences & Strict Config Validation', () => {
    it('should initialize with predictable default user configuration', async () => {
      const prefs = await userService.getUserPreferences(userId);
      expect(prefs).toEqual(DEFAULT_USER_CONFIG);
      expect(prefs.privacy.isPrivate).toBe(false);
      expect(prefs.privacy.showActivityHeatmap).toBe(true);
      expect(prefs.appearance.theme).toBe('system');
    });

    it('should update granular privacy settings while preserving existing preferences', async () => {
      const updated = await userService.updateUserPreferences(userId, {
        privacy: {
          isPrivate: true,
          showActivityHeatmap: false,
        },
      });

      expect(updated.privacy.isPrivate).toBe(true);
      expect(updated.privacy.showActivityHeatmap).toBe(false);
      // Untouched privacy fields remain intact
      expect(updated.privacy.showFollowersList).toBe(true);
      // Untouched appearance & notification fields remain intact
      expect(updated.appearance.theme).toBe('system');
    });

    it('should strictly reject invalid fields in config column via Zod', async () => {
      await expect(
        userService.updateUserPreferences(userId, {
          // @ts-expect-error test strict rejection of unknown property
          privacy: {
            unknownField: 'malicious-data',
          },
        })
      ).rejects.toThrow(ZodError);
    });

    it('should strictly reject invalid enum values in appearance config', async () => {
      await expect(
        userService.updateUserPreferences(userId, {
          appearance: {
            // @ts-expect-error invalid theme enum
            theme: 'neon-cyberpunk',
          },
        })
      ).rejects.toThrow(ZodError);
    });
  });

  describe('Public vs Private Profile Visibility', () => {
    it('should return full public profile when isPrivate is false', async () => {
      const profile = await userService.getProfileByUsername('alice', 'other-user-id');
      expect(profile.isPrivate).toBe(false);
      expect(profile.isOwner).toBe(false);
      expect(profile.username).toBe('alice');
      expect(profile.privacy?.showActivityHeatmap).toBe(true);
    });

    it('should return masked private profile when isPrivate is true and viewer is not the owner', async () => {
      // Set profile to private
      await userService.updateUserPreferences(userId, {
        privacy: { isPrivate: true },
      });

      const profile = await userService.getProfileByUsername('alice', 'stranger-id');
      expect(profile.isPrivate).toBe(true);
      expect(profile.isOwner).toBe(false);
      expect(profile).toHaveProperty('message', 'This developer profile is private');
      // Sensitive fields are masked
      expect(profile).not.toHaveProperty('role');
      expect(profile).not.toHaveProperty('config');
    });

    it('should return full profile with isOwner: true when the owner views their private profile', async () => {
      // Set profile to private
      await userService.updateUserPreferences(userId, {
        privacy: { isPrivate: true },
      });

      const profile = await userService.getProfileByUsername('alice', userId);
      expect(profile.isPrivate).toBe(true);
      expect(profile.isOwner).toBe(true);
      expect(profile).toHaveProperty('config');
      expect(profile.config?.privacy.isPrivate).toBe(true);
    });
  });
});
