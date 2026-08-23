import { and, eq } from 'drizzle-orm'
import { memFacts } from '@/server/db/memory-schema'
import type { PaymentTransaction } from '@/types/dbTypes'
import type {
  FactCandidate,
  PreparedFactCandidate,
  StoredFactCandidate,
} from '@/types/memoryTypes'

export async function storeFactCandidate(
  tx: PaymentTransaction,
  candidate: FactCandidate,
  prepared: PreparedFactCandidate
): Promise<StoredFactCandidate> {
  const [existing] = await tx
    .select({
      factId: memFacts.factId,
      status: memFacts.status,
      supersededBy: memFacts.supersededBy,
    })
    .from(memFacts)
    .where(
      and(
        eq(memFacts.userId, candidate.userId),
        eq(memFacts.contentHash, prepared.contentHash)
      )
    )
    .limit(1)
  if (
    existing &&
    (prepared.status !== 'active' ||
      (existing.status === 'active' && !existing.supersededBy))
  ) {
    return { outcome: 'duplicate', factId: existing.factId }
  }

  if (existing) {
    await tx
      .update(memFacts)
      .set({
        status: 'active',
        supersededBy: null,
        sourceRunId: candidate.sourceRunId,
        confidence: candidate.confidence,
        embedding: candidate.embedding ?? null,
        metadata: prepared.metadata,
        expiresAt: candidate.expiresAt ?? null,
        createdAt: new Date(),
      })
      .where(eq(memFacts.factId, existing.factId))
    return { outcome: 'stored', factId: existing.factId, reactivated: true }
  }

  const [inserted] = await tx
    .insert(memFacts)
    .values({
      userId: candidate.userId,
      subject: candidate.subject,
      predicate: candidate.predicate,
      content: candidate.content.trim(),
      contentHash: prepared.contentHash,
      status: prepared.status,
      source: candidate.source,
      sourceRunId: candidate.sourceRunId,
      confidence: candidate.confidence,
      embedding: candidate.embedding ?? null,
      metadata: prepared.metadata,
      expiresAt: candidate.expiresAt ?? null,
    })
    .returning({ factId: memFacts.factId })
  return { outcome: 'stored', factId: inserted!.factId, reactivated: false }
}
