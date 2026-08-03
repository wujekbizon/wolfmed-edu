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

// GDPR/RODO erasure of a student's memory, in one transaction. Facts and episodes
// are tombstoned (personal content wiped, embedding nulled, status revoked) rather
// than hard-deleted so the self-referential supersession FK stays valid; content_hash
// is reset to the row's own id to keep UNIQUE(content_hash, user_id) satisfied.
// Preferences and traces are hard-deleted. The deletion is logged.
//
// Idempotent: safe to re-run (a webhook retry just re-tombstones + adds an audit row).
export async function eraseUserMemory(userId: string, reason = 'account_deletion'): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(memFacts)
      .set({
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

    // Library chunks are hard-deleted rather than tombstoned: they carry no
    // self-referential FK, and they are a copy of the student's own notes and
    // materials, so nothing is lost that the source rows do not still hold.
    await tx.delete(libChunks).where(eq(libChunks.userId, userId))

    await tx.insert(memDeletionEvents).values({ userId, scope: 'all', reason })
  })
}
