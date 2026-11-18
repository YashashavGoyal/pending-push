import { IAnalyticsRepository } from '../repositories/interfaces/analytics.repository.interface.js';
import { IUserRepository } from '../repositories/interfaces/user.repository.interface.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors/app-error.js';
import {
  ActivityHeatmap,
  ActivityDay,
  AuthorTelemetry,
  PlatformStats,
  AdminUserItem,
  UserRole,
  PaginatedQuery,
  PaginatedResult,
} from '../types/index.js';

export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: IAnalyticsRepository,
    private readonly userRepository: IUserRepository
  ) {}

  public async getUserActivityHeatmap(
    username: string,
    requesterUserId?: string
  ): Promise<ActivityHeatmap> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isOwner = Boolean(requesterUserId && requesterUserId === user.id);
    const privacy = user.config?.privacy;

    if (!isOwner && (privacy?.isPrivate || !privacy?.showActivityHeatmap)) {
      throw new ForbiddenError('This user has set their activity heatmap to private');
    }

    // 52 weeks = 364 days trailing + today = 365 days
    const now = new Date();
    const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    startDate.setUTCDate(startDate.getUTCDate() - 364);

    const activityMap = await this.analyticsRepository.getUserActivityDays(user.id, startDate, endDate);

    const days: ActivityDay[] = [];
    let totalContributions = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const curr = new Date(startDate);
    while (curr <= endDate) {
      const year = curr.getUTCFullYear();
      const month = String(curr.getUTCMonth() + 1).padStart(2, '0');
      const day = String(curr.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const count = activityMap.get(dateStr) || 0;
      totalContributions += count;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count === 2) level = 2;
      else if (count === 1) level = 1;

      days.push({
        date: dateStr,
        count,
        level,
      });

      if (count > 0) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    // Calculate current streak
    let currentStreak = 0;
    const lastIndex = days.length - 1;
    let startIndex = lastIndex;

    // If today has 0 contributions, allow streak to be maintained by yesterday
    if (days[lastIndex].count === 0 && lastIndex > 0 && days[lastIndex - 1].count > 0) {
      startIndex = lastIndex - 1;
    }

    for (let i = startIndex; i >= 0; i--) {
      if (days[i].count > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      days,
      totalContributions,
      currentStreak,
      longestStreak,
    };
  }

  public async getAuthorTelemetry(userId: string): Promise<AuthorTelemetry> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return this.analyticsRepository.getAuthorTelemetry(userId);
  }

  public async getPlatformStats(): Promise<PlatformStats> {
    return this.analyticsRepository.getPlatformStats();
  }

  public async getAdminUsers(pagination?: PaginatedQuery): Promise<PaginatedResult<AdminUserItem>> {
    return this.analyticsRepository.getAdminUsers(pagination);
  }

  public async updateUserRole(
    targetUserId: string,
    role: UserRole,
    adminId: string
  ): Promise<AdminUserItem> {
    if (targetUserId === adminId && role !== 'admin') {
      throw new BadRequestError('Administrators cannot demote their own account');
    }

    const updated = await this.analyticsRepository.updateUserRole(targetUserId, role);
    if (!updated) {
      throw new NotFoundError('User not found');
    }

    return updated;
  }
}
