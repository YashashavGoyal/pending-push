import { UserSession } from '../../types/index.js';

export interface CreateSessionData {
  userId: string;
  tokenHash: string;
  deviceName?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
  expiresAt: Date;
}

export interface ISessionRepository {
  create(data: CreateSessionData): Promise<UserSession>;
  findByTokenHash(tokenHash: string): Promise<UserSession | null>;
  findById(id: string): Promise<UserSession | null>;
  findByUserId(userId: string): Promise<UserSession[]>;
  rotateToken(sessionId: string, newTokenHash: string, newExpiresAt: Date, ipAddress?: string): Promise<void>;
  revokeById(sessionId: string): Promise<boolean>;
  revokeAllForUser(userId: string, exceptSessionId?: string): Promise<number>;
}
