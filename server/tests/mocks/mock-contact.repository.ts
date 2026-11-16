import { IContactRepository, CreateContactData } from '../../src/repositories/interfaces/contact.repository.interface.js';
import { ContactMessage, PaginatedQuery, PaginatedResult } from '../../src/types/index.js';

export class MockContactRepository implements IContactRepository {
  public contacts: Map<string, ContactMessage> = new Map();

  public async create(data: CreateContactData): Promise<ContactMessage> {
    const id = `msg_${Date.now()}`;
    const msg: ContactMessage = {
      id,
      name: data.name,
      email: data.email,
      message: data.message,
      createdAt: new Date(),
    };
    this.contacts.set(id, msg);
    return msg;
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<ContactMessage>> {
    const items = Array.from(this.contacts.values());
    return { items, hasMore: false, nextCursor: null };
  }

  public async findById(id: string): Promise<ContactMessage | null> {
    return this.contacts.get(id) || null;
  }

  public async deleteById(id: string): Promise<boolean> {
    return this.contacts.delete(id);
  }
}
