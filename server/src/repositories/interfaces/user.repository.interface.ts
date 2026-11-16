import { User, UserConfig, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  name?: string;
  role?: 'user' | 'admin';
  config?: UserConfig;
}

export interface UpdateUserData {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  config?: UserConfig;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<User>>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  deleteById(id: string): Promise<boolean>;
}
