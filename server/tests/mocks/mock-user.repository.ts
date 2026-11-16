import { IUserRepository, CreateUserData } from '../../src/repositories/interfaces/user.repository.interface.js';
import { User, PaginatedQuery, PaginatedResult } from '../../src/types/index.js';

export class MockUserRepository implements IUserRepository {
  public users: Map<string, User> = new Map();

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
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    for (const u of this.users.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return u;
      }
    }
    return null;
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<User>> {
    const items = Array.from(this.users.values());
    return {
      items,
      hasMore: false,
      nextCursor: null,
    };
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
