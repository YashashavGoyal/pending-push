import { IContactRepository, CreateContactData } from '../interfaces/contact.repository.interface.js';
import { ContactMessage, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class ContactMemoryRepository implements IContactRepository {
  private contacts: Map<string, ContactMessage> = new Map();

  public async create(data: CreateContactData): Promise<ContactMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const message: ContactMessage = {
      id,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: new Date(),
    };
    this.contacts.set(id, message);
    return message;
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<ContactMessage>> {
    const list = Array.from(this.contacts.values()).sort(
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

  public async findById(id: string): Promise<ContactMessage | null> {
    return this.contacts.get(id) || null;
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }
}
