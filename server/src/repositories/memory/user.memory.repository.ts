import { IUserRepository, CreateUserData } from '../interfaces/user.repository.interface.js';
import { User, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class UserMemoryRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  public async create(data: CreateUserData): Promise<User> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    const user: User = {
      id,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(id, user);
    return user;
  }

  public async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === username.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<User>> {
    const list = Array.from(this.users.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const limit = pagination?.limit || 50;
    const items = list.slice(0, limit);

    return {
      items,
      hasMore: list.length > limit,
      nextCursor: items.length > 0 ? items[items.length - 1].id : null,
    };
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
