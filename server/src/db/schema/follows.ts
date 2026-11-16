import { pgTable, uuid, primaryKey, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    followingId: uuid('following_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.followerId, table.followingId] }),
    index('idx_follows_following').on(table.followingId),
  ]
);

export type FollowSelect = typeof follows.$inferSelect;
export type FollowInsert = typeof follows.$inferInsert;
