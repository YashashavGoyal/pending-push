import { ContactMessage, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export interface CreateContactData {
  name: string;
  email: string;
  message: string;
}

export interface IContactRepository {
  create(data: CreateContactData): Promise<ContactMessage>;
  findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<ContactMessage>>;
  findById(id: string): Promise<ContactMessage | null>;
  deleteById(id: string): Promise<boolean>;
}
