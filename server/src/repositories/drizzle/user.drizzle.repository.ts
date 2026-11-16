import { eq, desc, isNull, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { IUserRepository, CreateUserData } from '../interfaces/user.repository.interface.js';
import { User, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class UserDrizzleRepository implements IUserRepository {
  public async create(data: CreateUserData): Promise<User> {
    const [created] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.username,
        role: data.role || 'user',
      })
      .returning();

    return this.mapToDomain(created);
  }

  public async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return user ? this.mapToDomain(user) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email.toLowerCase()), isNull(users.deletedAt)))
      .limit(1);

    return user ? this.mapToDomain(user) : null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.username, username.toLowerCase()), isNull(users.deletedAt)))
      .limit(1);

    return user ? this.mapToDomain(user) : null;
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<User>> {
    const limit = pagination?.limit || 50;
    const rows = await db
      .select()
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const mapped = items.map((u) => this.mapToDomain(u));

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  public async deleteById(id: string): Promise<boolean> {
    // Soft delete: sets deletedAt timestamp
    const [updated] = await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return !!updated;
  }

  private mapToDomain(row: typeof users.$inferSelect): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.passwordHash,
      role: row.role as 'user' | 'admin',
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
