import 'server-only'
import crypto from 'crypto'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import type { FactSource, FactStatus } from './stores/facts'

// The gate owns status — callers never pass one in. Student statements and
// deterministic product events are trusted (active); only llm_inferred facts
// start provisional until corroborated.
export interface FactCandidate {
  userId: string
  subject: string
  predicate: string
  content: string
  source: FactSource
  sourceRunId: string
  confidence: number
  // Supersession slot: facts with the same (userId, factKey) replace each other.
  // Multi-valued predicates (e.g. weak_topic per topic) must set distinct keys so
  // a new nephrology fact doesn't revoke the cardiology one.
  factKey?: string
  metadata?: Record<string, unknown>
  embedding?: number[] | null
  hasSecondObservation?: boolean
  expiresAt?: Date | null
}

export type PromotionResult =
  | { outcome: 'inserted'; factId: string; status: FactStatus; superseded: string[] }
  | { outcome: 'duplicate'; factId: string }

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

function hashContent(text: string): string {
  return crypto.createHash('sha256').update(normalize(text)).digest('hex')
}

function computeStatus(c: FactCandidate): 'active' | 'provisional' {
  if (c.source !== 'llm_inferred') return 'active'
  return c.confidence >= 0.7 && c.hasSecondObservation ? 'active' : 'provisional'
}

// Classify + scope + dedup + contradiction → supersession, atomically. A new
// ACTIVE fact revokes the active facts it contradicts (same slot, different
// content) and points their superseded_by at itself. A provisional fact never
// revokes a good active fact.
export async function promoteFact(candidate: FactCandidate): Promise<PromotionResult> {
  const contentHash = hashContent(candidate.content)
  const status = computeStatus(candidate)
  const metadata = candidate.factKey
    ? { ...(candidate.metadata ?? {}), key: candidate.factKey }
    : candidate.metadata ?? null

  return db.transaction(async (tx) => {
    // Dedup — (content_hash, user_id) is unique.
    const [existing] = await tx
      .select({ factId: memFacts.factId })
      .from(memFacts)
      .where(and(eq(memFacts.userId, candidate.userId), eq(memFacts.contentHash, contentHash)))
      .limit(1)
    if (existing) return { outcome: 'duplicate', factId: existing.factId }

    const [inserted] = await tx
      .insert(memFacts)
      .values({
        userId: candidate.userId,
        subject: candidate.subject,
        predicate: candidate.predicate,
        content: candidate.content.trim(),
        contentHash,
        status,
        source: candidate.source,
        sourceRunId: candidate.sourceRunId,
        confidence: candidate.confidence,
        embedding: candidate.embedding ?? null,
        metadata,
        expiresAt: candidate.expiresAt ?? null,
      })
      .returning({ factId: memFacts.factId })

    const newFactId = inserted!.factId
    let superseded: string[] = []

    // Only an active fact supersedes; a provisional one must not evict a good fact.
    if (status === 'active') {
      const slot = candidate.factKey
        ? sql`${memFacts.metadata}->>'key' = ${candidate.factKey}`
        : and(eq(memFacts.subject, candidate.subject), eq(memFacts.predicate, candidate.predicate))

      const contradicted = await tx
        .select({ factId: memFacts.factId })
        .from(memFacts)
        .where(
          and(
            eq(memFacts.userId, candidate.userId),
            eq(memFacts.status, 'active'),
            isNull(memFacts.supersededBy),
            sql`${memFacts.contentHash} <> ${contentHash}`,
            slot
          )
        )

      superseded = contradicted.map((f) => f.factId)
      for (const id of superseded) {
        await tx.update(memFacts).set({ status: 'revoked', supersededBy: newFactId }).where(eq(memFacts.factId, id))
      }
    }

    return { outcome: 'inserted', factId: newFactId, status, superseded }
  })
}
