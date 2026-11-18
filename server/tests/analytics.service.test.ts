import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../src/services/analytics.service.js';
import { MockAnalyticsRepository } from './mocks/mock-analytics.repository.js';
import { MockUserRepository } from './mocks/mock-user.repository.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../src/errors/app-error.js';
import { DEFAULT_USER_CONFIG } from '../src/types/index.js';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockAnalyticsRepo: MockAnalyticsRepository;
  let mockUserRepo: MockUserRepository;

  beforeEach(() => {
    mockAnalyticsRepo = new MockAnalyticsRepository();
    mockUserRepo = new MockUserRepository();
    analyticsService = new AnalyticsService(mockAnalyticsRepo, mockUserRepo);
  });

  describe('getUserActivityHeatmap', () => {
    it('should generate 365 days of activity matrix with streak calculation', async () => {
      const user = await mockUserRepo.create({
        username: 'dev_alex',
        email: 'alex@example.com',
        passwordHash: 'hash',
        name: 'Alex Rivera',
      });

      // Mock recent contributions
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      mockAnalyticsRepo.activityDays.set(todayStr, 3);
      mockAnalyticsRepo.activityDays.set(yesterdayStr, 1);

      const result = await analyticsService.getUserActivityHeatmap('dev_alex');

      expect(result.days).toHaveLength(365);
      expect(result.totalContributions).toBe(4);
      expect(result.currentStreak).toBe(2);
      expect(result.longestStreak).toBe(2);

      const todayEntry = result.days.find((d) => d.date === todayStr);
      expect(todayEntry).toBeDefined();
      expect(todayEntry?.count).toBe(3);
      expect(todayEntry?.level).toBe(3);
    });

    it('should maintain current streak if today has 0 contributions but yesterday had contributions', async () => {
      await mockUserRepo.create({
        username: 'dev_streak',
        email: 'streak@example.com',
        passwordHash: 'hash',
      });

      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      mockAnalyticsRepo.activityDays.set(yesterdayStr, 2);

      const result = await analyticsService.getUserActivityHeatmap('dev_streak');
      expect(result.currentStreak).toBe(1);
    });

    it('should throw ForbiddenError when activity heatmap is set to private and accessed by non-owner', async () => {
      await mockUserRepo.create({
        username: 'private_dev',
        email: 'private@example.com',
        passwordHash: 'hash',
        config: {
          ...DEFAULT_USER_CONFIG,
          privacy: {
            ...DEFAULT_USER_CONFIG.privacy,
            showActivityHeatmap: false,
          },
        },
      });

      await expect(
        analyticsService.getUserActivityHeatmap('private_dev', 'other-user-id')
      ).rejects.toThrow(ForbiddenError);
    });

    it('should allow profile owner to view their own private activity heatmap', async () => {
      const user = await mockUserRepo.create({
        username: 'private_owner',
        email: 'owner@example.com',
        passwordHash: 'hash',
        config: {
          ...DEFAULT_USER_CONFIG,
          privacy: {
            ...DEFAULT_USER_CONFIG.privacy,
            showActivityHeatmap: false,
          },
        },
      });

      const result = await analyticsService.getUserActivityHeatmap('private_owner', user.id);
      expect(result.days).toHaveLength(365);
    });

    it('should throw NotFoundError if user does not exist', async () => {
      await expect(
        analyticsService.getUserActivityHeatmap('nonexistent_user')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAuthorTelemetry', () => {
    it('should return aggregated author metrics', async () => {
      const author = await mockUserRepo.create({
        username: 'telemetry_author',
        email: 'telemetry@example.com',
        passwordHash: 'hash',
      });

      const telemetry = await analyticsService.getAuthorTelemetry(author.id);

      expect(telemetry.totalViews).toBe(1250);
      expect(telemetry.totalClaps).toBe(340);
      expect(telemetry.totalFollowers).toBe(42);
      expect(telemetry.publishedPushesCount).toBe(8);
      expect(telemetry.draftsCount).toBe(2);
      expect(telemetry.avgRetentionRate).toBe(82.5);
      expect(telemetry.recentStories).toHaveLength(1);
    });

    it('should throw NotFoundError if author does not exist', async () => {
      await expect(
        analyticsService.getAuthorTelemetry('unknown-author')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlatformStats', () => {
    it('should return system-wide totals', async () => {
      const stats = await analyticsService.getPlatformStats();
      expect(stats.totalUsers).toBe(150);
      expect(stats.totalPublishedPosts).toBe(380);
      expect(stats.totalConfessions).toBe(65);
    });
  });

  describe('updateUserRole', () => {
    it('should update role from user to admin', async () => {
      const updated = await analyticsService.updateUserRole('user-1', 'admin', 'admin-1');
      expect(updated.role).toBe('admin');
    });

    it('should prevent an admin from demoting their own account', async () => {
      await expect(
        analyticsService.updateUserRole('admin-1', 'user', 'admin-1')
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError for non-existent user', async () => {
      await expect(
        analyticsService.updateUserRole('non-existent-user', 'admin', 'admin-1')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
