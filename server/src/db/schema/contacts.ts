import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ContactMessageSelect = typeof contactMessages.$inferSelect;
export type ContactMessageInsert = typeof contactMessages.$inferInsert;
