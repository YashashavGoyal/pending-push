import { ISessionRepository, CreateSessionData } from '../../src/repositories/interfaces/session.repository.interface.js';
import { UserSession } from '../../src/types/index.js';

export class MockSessionRepository implements ISessionRepository {
  public sessions: Map<string, UserSession> = new Map();

  public async create(data: CreateSessionData): Promise<UserSession> {
    const id = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const session: UserSession = {
      id,
      userId: data.userId,
      tokenHash: data.tokenHash,
      deviceName: data.deviceName || null,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      metadata: data.metadata || {},
      isRevoked: false,
      expiresAt: data.expiresAt,
      lastActiveAt: now,
      createdAt: now,
    };

    this.sessions.set(id, session);
    return session;
  }

  public async findByTokenHash(tokenHash: string): Promise<UserSession | null> {
    for (const s of this.sessions.values()) {
      if (s.tokenHash === tokenHash) {
        return s;
      }
    }
    return null;
  }

  public async findById(id: string): Promise<UserSession | null> {
    return this.sessions.get(id) || null;
  }

  public async findByUserId(userId: string): Promise<UserSession[]> {
    const results: UserSession[] = [];
    for (const s of this.sessions.values()) {
      if (s.userId === userId && !s.isRevoked) {
        results.push(s);
      }
    }
    return results.sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
  }

  public async rotateToken(
    sessionId: string,
    newTokenHash: string,
    newExpiresAt: Date,
    ipAddress?: string
  ): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.tokenHash = newTokenHash;
      session.expiresAt = newExpiresAt;
      session.lastActiveAt = new Date();
      if (ipAddress) {
        session.ipAddress = ipAddress;
      }
      this.sessions.set(sessionId, session);
    }
  }

  public async revokeById(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isRevoked = true;
      this.sessions.set(sessionId, session);
      return true;
    }
    return false;
  }

  public async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<number> {
    let count = 0;
    for (const s of this.sessions.values()) {
      if (s.userId === userId && !s.isRevoked && s.id !== exceptSessionId) {
        s.isRevoked = true;
        this.sessions.set(s.id, s);
        count++;
      }
    }
    return count;
  }

  public async deleteExpiredSessions(olderThanDays = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    const now = new Date();

    let count = 0;
    for (const [id, s] of this.sessions.entries()) {
      const isExpired = s.expiresAt < now;
      const isRevokedAndOld = s.isRevoked && s.lastActiveAt < cutoffDate;
      if (isExpired || isRevokedAndOld) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }
}
