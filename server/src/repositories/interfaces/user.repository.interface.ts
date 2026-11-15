import { User, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  role?: 'user' | 'admin';
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<User>>;
  deleteById(id: string): Promise<boolean>;
}
