import { eq, and, desc, ne } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { userSessions } from '../../db/schema/index.js';
import { ISessionRepository, CreateSessionData } from '../interfaces/session.repository.interface.js';
import { UserSession } from '../../types/index.js';

export class SessionDrizzleRepository implements ISessionRepository {
  public async create(data: CreateSessionData): Promise<UserSession> {
    const [created] = await db
      .insert(userSessions)
      .values({
        userId: data.userId,
        tokenHash: data.tokenHash,
        deviceName: data.deviceName || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata || {},
        expiresAt: data.expiresAt,
      })
      .returning();

    return this.mapToDomain(created);
  }

  public async findByTokenHash(tokenHash: string): Promise<UserSession | null> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.tokenHash, tokenHash))
      .limit(1);

    return session ? this.mapToDomain(session) : null;
  }

  public async findById(id: string): Promise<UserSession | null> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, id))
      .limit(1);

    return session ? this.mapToDomain(session) : null;
  }

  public async findByUserId(userId: string): Promise<UserSession[]> {
    const rows = await db
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isRevoked, false)))
      .orderBy(desc(userSessions.lastActiveAt));

    return rows.map((r) => this.mapToDomain(r));
  }

  public async rotateToken(
    sessionId: string,
    newTokenHash: string,
    newExpiresAt: Date,
    ipAddress?: string
  ): Promise<void> {
    const updateValues: Partial<typeof userSessions.$inferInsert> = {
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
      lastActiveAt: new Date(),
    };

    if (ipAddress) {
      updateValues.ipAddress = ipAddress;
    }

    await db
      .update(userSessions)
      .set(updateValues)
      .where(eq(userSessions.id, sessionId));
  }

  public async revokeById(sessionId: string): Promise<boolean> {
    const [updated] = await db
      .update(userSessions)
      .set({ isRevoked: true })
      .where(eq(userSessions.id, sessionId))
      .returning();

    return !!updated;
  }

  public async revokeAllForUser(userId: string, exceptSessionId?: string): Promise<number> {
    const conditions = [eq(userSessions.userId, userId), eq(userSessions.isRevoked, false)];

    if (exceptSessionId) {
      conditions.push(ne(userSessions.id, exceptSessionId));
    }

    const updated = await db
      .update(userSessions)
      .set({ isRevoked: true })
      .where(and(...conditions))
      .returning();

    return updated.length;
  }

  private mapToDomain(row: typeof userSessions.$inferSelect): UserSession {
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      deviceName: row.deviceName,
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      metadata: (row.metadata as Record<string, unknown>) || {},
      isRevoked: row.isRevoked,
      expiresAt: row.expiresAt,
      lastActiveAt: row.lastActiveAt,
      createdAt: row.createdAt,
    };
  }
}
