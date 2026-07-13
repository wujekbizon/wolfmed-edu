import {
  pgTableCreator,
  text,
  jsonb,
  integer,
  real,
  timestamp,
  vector,
  index,
  uniqueIndex,
  check,
  primaryKey,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { EMBED_DIM, MEM_TABLES } from '@/server/memory/config'

// Local table creator (same 'wolfmed_' prefix as the main schema). Declared here
// rather than imported from schema.ts to avoid a circular import — schema.ts
// re-exports this file so drizzle-kit and the ORM see these tables.
const memTable = pgTableCreator((name) => `wolfmed_${name}`)

const uuidText = sql`gen_random_uuid()::text`

// ── Policies — pedagogical/product rules, exact-match lookup only ────────────
export const memPolicies = memTable(
  MEM_TABLES.policies,
  {
    policyId: text('policy_id').primaryKey().default(uuidText),
    tenantId: text('tenant_id').notNull().default('wolfmed'),
    policyType: text('policy_type').notNull(),
    policyKey: text('policy_key').notNull(),
    policyValue: jsonb('policy_value').notNull(),
    version: integer('version').notNull().default(1),
    effectiveFrom: timestamp('effective_from', { withTimezone: true }).notNull().defaultNow(),
    effectiveUntil: timestamp('effective_until', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('uq_mem_policy_ver').on(t.tenantId, t.policyKey, t.version),
    index('idx_mem_policy_lookup')
      .on(t.tenantId, t.policyKey)
      .where(sql`effective_until IS NULL`),
    check('mem_policy_type_chk', sql`${t.policyType} IN ('pedagogy','guardrail','blueprint','product')`),
  ]
)

// ── Preferences — loaded in full every turn, feed the cacheable static prefix ─
export const memPreferences = memTable(
  MEM_TABLES.preferences,
  {
    userId: text('user_id').notNull(),
    prefKey: text('pref_key').notNull(),
    prefValue: jsonb('pref_value').notNull(),
    source: text('source').notNull(),
    confidence: real('confidence'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.prefKey] }),
    check('mem_pref_source_chk', sql`${t.source} IN ('user_stated','llm_inferred','admin_set')`),
  ]
)

// ── Facts — the compounding layer ───────────────────────────────────────────
export const memFacts = memTable(
  MEM_TABLES.facts,
  {
    factId: text('fact_id').primaryKey().default(uuidText),
    userId: text('user_id').notNull(),
    subject: text('subject').notNull(),
    predicate: text('predicate').notNull(),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(), // sha256(normalized content)
    embedding: vector('embedding', { dimensions: EMBED_DIM }), // nullable projection
    metadata: jsonb('metadata'),
    status: text('status').notNull().default('provisional'),
    source: text('source').notNull(),
    sourceRunId: text('source_run_id').notNull(),
    confidence: real('confidence').notNull(),
    supersededBy: text('superseded_by').references((): AnyPgColumn => memFacts.factId),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('uq_mem_fact_hash').on(t.contentHash, t.userId), // dedup key: hash + scope
    index('idx_mem_fact_scope').on(t.userId, t.status),
    index('idx_mem_fact_trgm').using('gin', t.content.op('gin_trgm_ops')),
    index('idx_mem_fact_vec').using('hnsw', t.embedding.op('vector_cosine_ops')),
    check('mem_fact_status_chk', sql`${t.status} IN ('provisional','active','revoked')`),
    check(
      'mem_fact_source_chk',
      sql`${t.source} IN ('user_stated','quiz_derived','mindmap_derived','llm_inferred','admin_set')`
    ),
  ]
)

// ── Episodes — "ostatnio przerabialiśmy…" ───────────────────────────────────
export const memEpisodes = memTable(
  MEM_TABLES.episodes,
  {
    episodeId: text('episode_id').primaryKey().default(uuidText),
    userId: text('user_id').notNull(),
    taskType: text('task_type').notNull(), // tutor_session | quiz | mindmap_review
    title: text('title').notNull(),
    summary: text('summary').notNull(),
    outcome: text('outcome').notNull(),
    keySteps: jsonb('key_steps'),
    artifacts: jsonb('artifacts'), // quiz ids, mind map ids
    embedding: vector('embedding', { dimensions: EMBED_DIM }),
    status: text('status').notNull().default('active'),
    sourceRunId: text('source_run_id').notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_mem_ep_scope').on(t.userId, t.taskType, t.completedAt.desc()),
    index('idx_mem_ep_trgm').using('gin', t.summary.op('gin_trgm_ops')),
    index('idx_mem_ep_vec').using('hnsw', t.embedding.op('vector_cosine_ops')),
    check('mem_ep_status_chk', sql`${t.status} IN ('provisional','active','revoked')`),
  ]
)

// ── Traces — per-turn flight recorder, 90-day retention ─────────────────────
export const memTraces = memTable(
  MEM_TABLES.traces,
  {
    traceId: text('trace_id').primaryKey().default(uuidText),
    runId: text('run_id').notNull(), // one tutor session
    userId: text('user_id').notNull(),
    turnIndex: integer('turn_index').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    tokenCost: integer('token_cost'),
    latencyMs: integer('latency_ms'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('idx_mem_trace_run').on(t.runId, t.turnIndex),
    index('idx_mem_trace_user').on(t.userId, t.createdAt.desc()),
    check(
      'mem_trace_event_chk',
      sql`${t.eventType} IN ('user_msg','rag_retrieval','memory_retrieval','model_msg','promotion')`
    ),
  ]
)

// ── Deletion events — GDPR audit log (append-only) ──────────────────────────
export const memDeletionEvents = memTable(MEM_TABLES.deletionEvents, {
  userId: text('user_id').notNull(),
  scope: text('scope').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }).notNull().defaultNow(),
  reason: text('reason').notNull(),
})

// Type exports
export type MemPolicy = typeof memPolicies.$inferSelect
export type MemPreference = typeof memPreferences.$inferSelect
export type MemFact = typeof memFacts.$inferSelect
export type MemEpisode = typeof memEpisodes.$inferSelect
export type MemTrace = typeof memTraces.$inferSelect
export type MemDeletionEvent = typeof memDeletionEvents.$inferSelect
