import 'server-only'
import { and, desc, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts, type MemFact } from '@/server/db/memory-schema'

export type FactStatus = 'provisional' | 'active' | 'revoked'
export type FactSource =
  | 'user_stated'
  | 'quiz_derived'
  | 'mindmap_derived'
  | 'llm_inferred'
  | 'admin_set'

export interface NewFact {
  userId: string
  subject: string
  predicate: string
  content: string
  contentHash: string
  status: FactStatus
  source: FactSource
  sourceRunId: string
  confidence: number
  embedding?: number[] | null
  metadata?: Record<string, unknown> | null
  expiresAt?: Date | null
}

// Dedup key is (content_hash, user_id) — at most one row exists regardless of
// status, so this returns whatever is there.
export async function getFactByHash(userId: string, contentHash: string): Promise<MemFact | null> {
  const [row] = await db
    .select()
    .from(memFacts)
    .where(and(eq(memFacts.userId, userId), eq(memFacts.contentHash, contentHash)))
    .limit(1)
  return row ?? null
}

// Active facts occupying the same supersession "slot" (metadata.key), used by the
// gate for contradiction detection. Falls back to (subject, predicate) when no key.
export async function getActiveFactsForSlot(
  userId: string,
  subject: string,
  predicate: string,
  factKey?: string
): Promise<MemFact[]> {
  const scope = and(
    eq(memFacts.userId, userId),
    eq(memFacts.status, 'active'),
    isNull(memFacts.supersededBy)
  )
  const slot = factKey
    ? sql`${memFacts.metadata}->>'key' = ${factKey}`
    : and(eq(memFacts.subject, subject), eq(memFacts.predicate, predicate))

  return db.select().from(memFacts).where(and(scope, slot))
}

export async function insertFact(fact: NewFact): Promise<MemFact> {
  const [row] = await db
    .insert(memFacts)
    .values({
      userId: fact.userId,
      subject: fact.subject,
      predicate: fact.predicate,
      content: fact.content,
      contentHash: fact.contentHash,
      status: fact.status,
      source: fact.source,
      sourceRunId: fact.sourceRunId,
      confidence: fact.confidence,
      embedding: fact.embedding ?? null,
      metadata: fact.metadata ?? null,
      expiresAt: fact.expiresAt ?? null,
    })
    .returning()
  return row!
}

export async function revokeFact(factId: string, supersededByFactId: string): Promise<void> {
  await db
    .update(memFacts)
    .set({ status: 'revoked', supersededBy: supersededByFactId })
    .where(eq(memFacts.factId, factId))
}

// Active facts for a user, newest first — used by assembly / retrieval fallback.
export async function getActiveFacts(userId: string, limit = 50): Promise<MemFact[]> {
  return db
    .select()
    .from(memFacts)
    .where(and(eq(memFacts.userId, userId), eq(memFacts.status, 'active'), isNull(memFacts.supersededBy)))
    .orderBy(desc(memFacts.createdAt))
    .limit(limit)
}
