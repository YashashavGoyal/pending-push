export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserPublicProfile = Omit<User, 'passwordHash'>;

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string; // Markdown or JSON stringified AST
  summary?: string | null;
  coverImage?: string | null;
  published: boolean;
  readingTimeMinutes: number;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
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
