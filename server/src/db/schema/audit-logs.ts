import { pgTable, uuid, varchar, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorRole: varchar('actor_role', { length: 50 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    targetType: varchar('target_type', { length: 50 }).notNull(),
    targetId: varchar('target_id', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    details: jsonb('details').default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_audit_logs_actor').on(table.actorId),
    index('idx_audit_logs_action').on(table.action),
    index('idx_audit_logs_target').on(table.targetType, table.targetId),
  ]
);

export type AuditLogSelect = typeof auditLogs.$inferSelect;
export type AuditLogInsert = typeof auditLogs.$inferInsert;
