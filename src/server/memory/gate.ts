import 'server-only'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memFacts } from '@/server/db/memory-schema'
import { prepareFactCandidate } from './prepareFactCandidate'
import { storeFactCandidate } from './storeFactCandidate'
import type { FactCandidate, PromotionResult } from '@/types/memoryTypes'
import type { PaymentTransaction } from '@/types/dbTypes'

// Classify + scope + dedup + contradiction → supersession, atomically. A new
// ACTIVE fact revokes the active facts it contradicts (same slot, different
// content) and points their superseded_by at itself. A provisional fact never
// revokes a good active fact.
export async function promoteFact(candidate: FactCandidate, transaction?: PaymentTransaction): Promise<PromotionResult> {
  const prepared = prepareFactCandidate(candidate)

  const promote = async (tx: PaymentTransaction): Promise<PromotionResult> => {
    const slotKey = candidate.factKey ?? `${candidate.subject}:${candidate.predicate}`
    const lockKey = `${candidate.userId}:${slotKey}`
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`)
    const stored = await storeFactCandidate(tx, candidate, prepared)
    if (stored.outcome === 'duplicate') return stored

    const newFactId = stored.factId
    let superseded: string[] = []

    if (prepared.status === 'active') {
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
            sql`${memFacts.contentHash} <> ${prepared.contentHash}`,
            slot
          )
        )

      superseded = contradicted.map((f) => f.factId)
      for (const id of superseded) {
        await tx.update(memFacts).set({ status: 'revoked', supersededBy: newFactId }).where(eq(memFacts.factId, id))
      }
    }

    return stored.reactivated
      ? { outcome: 'reactivated', factId: newFactId, status: 'active', superseded }
      : { outcome: 'inserted', factId: newFactId, status: prepared.status, superseded }
  }
  return transaction ? promote(transaction) : db.transaction(promote)
}
