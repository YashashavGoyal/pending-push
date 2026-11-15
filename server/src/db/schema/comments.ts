import { pgTable, uuid, text, timestamp, index, AnyPgColumn } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { posts } from './posts.js';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    postId: uuid('post_id')
      .references(() => posts.id, { onDelete: 'cascade' })
      .notNull(),
    authorId: uuid('author_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_comments_post').on(table.postId),
    index('idx_comments_parent').on(table.parentId),
  ]
);

export type CommentSelect = typeof comments.$inferSelect;
export type CommentInsert = typeof comments.$inferInsert;
