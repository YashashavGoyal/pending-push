import { pgTable, uuid, varchar, text, timestamp, integer, pgEnum, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'archived']);

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    authorId: uuid('author_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 300 }).notNull().unique(),
    summary: varchar('summary', { length: 500 }),
    content: jsonb('content').default({}).notNull(),
    contentText: text('content_text').default('').notNull(),
    coverImage: text('cover_image'),
    status: postStatusEnum('status').default('draft').notNull(),
    readingTimeMinutes: integer('reading_time_minutes').default(1).notNull(),
    viewsCount: integer('views_count').default(0).notNull(),
    clapsCount: integer('claps_count').default(0).notNull(),
    config: jsonb('config').default({}).notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_posts_slug').on(table.slug),
    index('idx_posts_author_published').on(table.authorId, table.publishedAt),
    index('idx_posts_feed').on(table.status, table.publishedAt),
    index('idx_posts_deleted_at').on(table.deletedAt),
  ]
);

export type PostSelect = typeof posts.$inferSelect;
export type PostInsert = typeof posts.$inferInsert;
