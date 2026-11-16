import { eq, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { contactMessages } from '../../db/schema/index.js';
import { IContactRepository, CreateContactData } from '../interfaces/contact.repository.interface.js';
import { ContactMessage, PaginatedQuery, PaginatedResult } from '../../types/index.js';

export class ContactDrizzleRepository implements IContactRepository {
  public async create(data: CreateContactData): Promise<ContactMessage> {
    const [created] = await db
      .insert(contactMessages)
      .values({
        name: data.name,
        email: data.email,
        message: data.message,
      })
      .returning();

    return {
      id: created.id,
      name: created.name,
      email: created.email,
      message: created.message,
      createdAt: created.createdAt,
    };
  }

  public async findAll(pagination?: PaginatedQuery): Promise<PaginatedResult<ContactMessage>> {
    const limit = pagination?.limit || 50;

    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    const mapped: ContactMessage[] = items.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      message: r.message,
      createdAt: r.createdAt,
    }));

    return {
      items: mapped,
      hasMore,
      nextCursor: mapped.length > 0 ? mapped[mapped.length - 1].id : null,
    };
  }

  public async findById(id: string): Promise<ContactMessage | null> {
    const [row] = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      createdAt: row.createdAt,
    };
  }

  public async deleteById(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning();

    return !!deleted;
  }
}
