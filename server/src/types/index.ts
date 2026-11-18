export type UserRole = 'user' | 'admin';

export interface UserPrivacyConfig {
  isPrivate: boolean;
  showActivityHeatmap: boolean;
  showFollowersList: boolean;
  showReadingList: boolean;
}

export interface UserAppearanceConfig {
  theme: 'system' | 'light' | 'dark';
  fontFamily: 'sans' | 'serif' | 'mono';
  codeLigatures: boolean;
}

export interface UserNotificationConfig {
  emailDigest: boolean;
  newFollower: boolean;
  newComment: boolean;
}

export interface UserConfig {
  privacy: UserPrivacyConfig;
  appearance: UserAppearanceConfig;
  notifications: UserNotificationConfig;
}

export const DEFAULT_USER_CONFIG: UserConfig = {
  privacy: {
    isPrivate: false,
    showActivityHeatmap: true,
    showFollowersList: true,
    showReadingList: false,
  },
  appearance: {
    theme: 'system',
    fontFamily: 'sans',
    codeLigatures: true,
  },
  notifications: {
    emailDigest: true,
    newFollower: true,
    newComment: true,
  },
};

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  bio?: string | null;
  avatarUrl?: string | null;
  config: UserConfig;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublicProfile = Omit<User, 'passwordHash'>;

export type PostFormat = 'article' | 'dev_log' | 'tutorial' | 'confession';
export type PostStatus = 'draft' | 'published' | 'archived';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or JSON stringified AST
  summary?: string | null;
  coverImage?: string | null;
  format: PostFormat;
  isAnonymous: boolean;
  published: boolean;
  readingTimeMinutes: number;
  viewsCount: number;
  clapsCount: number;
  authorId: string;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
    name?: string | null;
    avatarUrl?: string | null;
  } | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export interface AuthPayload {
  userId: string;
  role: UserRole;
}

export interface PaginatedQuery {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: unknown;
  };
}

export interface UserSession {
  id: string;
  userId: string;
  tokenHash: string;
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata: Record<string, unknown>;
  isRevoked: boolean;
  expiresAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface SessionPublicInfo {
  id: string;
  deviceName?: string | null;
  ipAddress?: string | null;
  metadata: Record<string, unknown>;
  lastActiveAt: Date;
  createdAt: Date;
  isCurrent?: boolean;
}

export interface ClientDeviceInfo {
  deviceName: string;
  ipAddress: string;
  userAgent: string;
  metadata: {
    browser?: string;
    os?: string;
    device?: string;
    [key: string]: unknown;
  };
}

export interface ClapResult {
  userClaps: number;
  totalClaps: number;
}

export interface CommentAuthor {
  id: string;
  username: string;
  name?: string | null;
  avatarUrl?: string | null;
}

export interface CommentItem {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string | null;
  content: string;
  author?: CommentAuthor;
  replies?: CommentItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ================= ACTIVITY & HEATMAP =================
export interface ActivityDay {
  date: string; // 'YYYY-MM-DD'
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ActivityHeatmap {
  days: ActivityDay[];
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}

// ================= AUTHOR TELEMETRY =================
export interface StoryMetric {
  id: string;
  title: string;
  slug: string;
  format: PostFormat;
  status: PostStatus;
  viewsCount: number;
  clapsCount: number;
  publishedAt?: Date | null;
  createdAt: Date;
}

export interface AuthorTelemetry {
  totalViews: number;
  totalClaps: number;
  totalFollowers: number;
  publishedPushesCount: number;
  draftsCount: number;
  avgRetentionRate: number;
  recentStories: StoryMetric[];
}

// ================= PLATFORM ADMIN TELEMETRY =================
export interface PlatformStats {
  totalUsers: number;
  totalPosts: number;
  totalPublishedPosts: number;
  totalDrafts: number;
  totalConfessions: number;
  totalComments: number;
  totalClaps: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Suspended';
  postsCount: number;
  createdAt: Date;
}
