import { pgTableCreator, uuid, varchar, jsonb, text, integer, timestamp, index, boolean } from 'drizzle-orm/pg-core'
import { users, learningPracticeSessions } from './schema'
import type { JevAuditContext, JevAuditStatus, JevRequestPayload } from '@/types/jevAuditTypes'

const jevTable = pgTableCreator((name) => `wolfmed_${name}`)

export const jevAuditLogs = jevTable('jev_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 256 }).references(() => users.userId, { onDelete: 'cascade' }),
  sessionId: uuid('session_id').references(() => learningPracticeSessions.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 32 }).$type<JevAuditContext['source']>().notNull(),
  route: varchar('route', { length: 64 }).notNull(),
  policyVersion: varchar('policy_version', { length: 128 }).notNull(),
  model: varchar('model', { length: 64 }).notNull(),
  requestPayload: jsonb('request_payload').$type<JevRequestPayload>().notNull(),
  responsePayload: jsonb('response_payload').$type<unknown>(),
  responseText: text('response_text'),
  status: varchar('status', { length: 32 }).$type<JevAuditStatus>().notNull(),
  httpStatus: integer('http_status'),
  errorName: varchar('error_name', { length: 128 }),
  errorMessage: text('error_message'),
  latencyMs: integer('latency_ms').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usageAggregated: boolean('usage_aggregated').notNull().default(false),
}, (table) => [
  index('jev_audit_user_created_idx').on(table.userId, table.createdAt),
  index('jev_audit_source_created_idx').on(table.source, table.createdAt),
  index('jev_audit_status_created_idx').on(table.status, table.createdAt),
  index('jev_audit_expires_idx').on(table.expiresAt),
])
