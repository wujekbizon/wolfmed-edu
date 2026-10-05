import { pgTableCreator, uuid, varchar, text, real, boolean, bigint, date, timestamp, index, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './schema'
import type { WolfekInteraction, WolfekMetricIncrement } from '@/types/wolfekMetricTypes'

const metricsTable = pgTableCreator((name) => `wolfmed_${name}`)

export const wolfekInteractions = metricsTable('wolfek_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 256 }).references(() => users.userId, { onDelete: 'cascade' }),
  source: varchar('source', { length: 32 }).$type<WolfekInteraction['source']>().notNull(),
  route: varchar('route', { length: 64 }).notNull(),
  kind: varchar('kind', { length: 32 }).$type<WolfekInteraction['kind']>().notNull(),
  question: text('question'),
  topic: varchar('topic', { length: 128 }),
  confidence: real('confidence'),
  outcome: varchar('outcome', { length: 32 }).$type<WolfekInteraction['outcome']>().notNull(),
  needsReview: boolean('needs_review').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  index('wolfek_interactions_source_created_idx').on(table.source, table.createdAt),
  index('wolfek_interactions_expires_idx').on(table.expiresAt),
])

export const wolfekDailyMetrics = metricsTable('wolfek_daily_metrics', {
  day: date('day').notNull(),
  source: varchar('source', { length: 32 }).$type<WolfekMetricIncrement['source']>().notNull(),
  route: varchar('route', { length: 64 }).notNull(),
  model: varchar('model', { length: 64 }).notNull(),
  kind: varchar('kind', { length: 32 }).$type<WolfekMetricIncrement['kind']>().notNull(),
  outcome: varchar('outcome', { length: 32 }).notNull(),
  topic: varchar('topic', { length: 128 }).notNull(),
  calls: bigint('calls', { mode: 'number' }).notNull().default(0),
  inputTokens: bigint('input_tokens', { mode: 'number' }).notNull().default(0),
  outputTokens: bigint('output_tokens', { mode: 'number' }).notNull().default(0),
  missingUsage: bigint('missing_usage', { mode: 'number' }).notNull().default(0),
  latencyMs: bigint('latency_ms', { mode: 'number' }).notNull().default(0),
  reviewCount: bigint('review_count', { mode: 'number' }).notNull().default(0),
}, (table) => [
  primaryKey({ columns: [table.day, table.source, table.route, table.model, table.kind, table.outcome, table.topic] }),
  index('wolfek_daily_source_day_idx').on(table.source, table.day),
])
