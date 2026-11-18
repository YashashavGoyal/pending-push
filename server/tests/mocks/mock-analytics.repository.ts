import { IAnalyticsRepository } from '../../src/repositories/interfaces/analytics.repository.interface.js';
import {
  AuthorTelemetry,
  PlatformStats,
  AdminUserItem,
  UserRole,
  PaginatedQuery,
  PaginatedResult,
} from '../../src/types/index.js';

export class MockAnalyticsRepository implements IAnalyticsRepository {
  public activityDays: Map<string, number> = new Map();
  public telemetry: AuthorTelemetry = {
    totalViews: 1250,
    totalClaps: 340,
    totalFollowers: 42,
    publishedPushesCount: 8,
    draftsCount: 2,
    avgRetentionRate: 82.5,
    recentStories: [
      {
        id: 'post-1',
        title: 'Building High-Throughput Web Apps',
        slug: 'building-high-throughput-web-apps',
        format: 'article',
        status: 'published',
        viewsCount: 650,
        clapsCount: 180,
        publishedAt: new Date(),
        createdAt: new Date(),
      },
    ],
  };

  public stats: PlatformStats = {
    totalUsers: 150,
    totalPosts: 450,
    totalPublishedPosts: 380,
    totalDrafts: 70,
    totalConfessions: 65,
    totalComments: 890,
    totalClaps: 3420,
  };

  public adminUsers: AdminUserItem[] = [
    {
      id: 'admin-1',
      name: 'Admin Root',
      username: 'admin',
      email: 'admin@pendingpush.dev',
      role: 'admin',
      status: 'Active',
      postsCount: 12,
      createdAt: new Date(),
    },
    {
      id: 'user-1',
      name: 'Test Author',
      username: 'testauthor',
      email: 'author@test.com',
      role: 'user',
      status: 'Active',
      postsCount: 5,
      createdAt: new Date(),
    },
  ];

  public async getUserActivityDays(
    _userId: string,
    _startDate: Date,
    _endDate: Date
  ): Promise<Map<string, number>> {
    return new Map(this.activityDays);
  }

  public async getAuthorTelemetry(_authorId: string): Promise<AuthorTelemetry> {
    return this.telemetry;
  }

  public async getPlatformStats(): Promise<PlatformStats> {
    return this.stats;
  }

  public async getAdminUsers(pagination?: PaginatedQuery): Promise<PaginatedResult<AdminUserItem>> {
    const limit = pagination?.limit || 20;
    const items = this.adminUsers.slice(0, limit);
    return {
      items,
      hasMore: this.adminUsers.length > limit,
      nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    };
  }

  public async updateUserRole(userId: string, role: UserRole): Promise<AdminUserItem | null> {
    const user = this.adminUsers.find((u) => u.id === userId);
    if (!user) return null;
    user.role = role;
    return user;
  }
}
