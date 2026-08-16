import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import {
  memFacts,
  memEpisodes,
  memPreferences,
  memTraces,
  memDeletionEvents,
} from '@/server/db/memory-schema'
import { libChunks } from '@/server/db/library-schema'
import type { PaymentTransaction } from '@/types/dbTypes'

export async function eraseUserMemoryInTransaction(
  tx: PaymentTransaction,
  userId: string,
  erasedUserId: string,
  reason = 'account_deletion'
): Promise<void> {
  await tx
    .update(memFacts)
    .set({
      userId: erasedUserId,
      content: '[erased]',
      contentHash: sql`${memFacts.factId}`,
      embedding: null,
      metadata: null,
      status: 'revoked',
    })
    .where(eq(memFacts.userId, userId))

  await tx
    .update(memEpisodes)
    .set({
      userId: erasedUserId,
      title: '[erased]',
      summary: '[erased]',
      outcome: '[erased]',
      keySteps: null,
      artifacts: null,
      embedding: null,
      status: 'revoked',
    })
    .where(eq(memEpisodes.userId, userId))

  await tx.delete(memPreferences).where(eq(memPreferences.userId, userId))
  await tx.delete(memTraces).where(eq(memTraces.userId, userId))

  await tx.delete(libChunks).where(eq(libChunks.userId, userId))

  await tx.insert(memDeletionEvents).values({
    userId: erasedUserId,
    scope: 'all',
    reason,
  })
}

export async function eraseUserMemory(
  userId: string,
  reason = 'account_deletion'
): Promise<void> {
  const erasedUserId = `deleted:${crypto.randomUUID()}`
  await db.transaction(async (tx) => {
    await eraseUserMemoryInTransaction(tx, userId, erasedUserId, reason)
  })
}
