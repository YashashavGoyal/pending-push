import {
  ActivityDay,
  AuthorTelemetry,
  PlatformStats,
  AdminUserItem,
  UserRole,
  PaginatedQuery,
  PaginatedResult,
} from '../../types/index.js';

export interface IAnalyticsRepository {
  getUserActivityDays(userId: string, startDate: Date, endDate: Date): Promise<Map<string, number>>;
  getAuthorTelemetry(authorId: string): Promise<AuthorTelemetry>;
  getPlatformStats(): Promise<PlatformStats>;
  getAdminUsers(pagination?: PaginatedQuery): Promise<PaginatedResult<AdminUserItem>>;
  updateUserRole(userId: string, role: UserRole): Promise<AdminUserItem | null>;
}
