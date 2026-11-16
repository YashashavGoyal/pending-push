import { pgTable, uuid, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { posts } from './posts.js';

export const claps = pgTable(
  'claps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id')
      .references(() => posts.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    count: integer('count').default(1).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_claps_post_user').on(table.postId, table.userId),
  ]
);

export type ClapSelect = typeof claps.$inferSelect;
export type ClapInsert = typeof claps.$inferInsert;
