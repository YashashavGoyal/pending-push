import { eq, desc, isNull, and } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { IUserRepository, CreateUserData, UpdateUserData } from '../interfaces/user.repository.interface.js';
import { User, UserConfig, DEFAULT_USER_CONFIG, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class UserDrizzleRepository implements IUserRepository {
  public async create(data: CreateUserData): Promise<User> {
    const config = data.config || DEFAULT_USER_CONFIG;

    const [created] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name || data.username,
        role: data.role || 'user',
        config,
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

  public async update(id: string, data: UpdateUserData): Promise<User | null> {
    const updateValues: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateValues.name = data.name;
    if (data.bio !== undefined) updateValues.bio = data.bio;
    if (data.avatarUrl !== undefined) updateValues.avatarUrl = data.avatarUrl;
    if (data.config !== undefined) updateValues.config = data.config;

    const [updated] = await db
      .update(users)
      .set(updateValues)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .returning();

    return updated ? this.mapToDomain(updated) : null;
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
    const rawConfig = (row.config as Record<string, any>) || {};
    const config: UserConfig = {
      privacy: {
        ...DEFAULT_USER_CONFIG.privacy,
        ...(rawConfig.privacy || {}),
      },
      appearance: {
        ...DEFAULT_USER_CONFIG.appearance,
        ...(rawConfig.appearance || {}),
      },
      notifications: {
        ...DEFAULT_USER_CONFIG.notifications,
        ...(rawConfig.notifications || {}),
      },
    };

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name || row.username,
      role: row.role as 'user' | 'admin',
      bio: row.bio,
      avatarUrl: row.avatarUrl,
      config,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
