import 'server-only'
import { reconcileQuizMemory } from './reconcileQuizMemory'
import { reconcileDiagnozyMemory } from './reconcileDiagnozyMemory'
import { reconcileChallengeMemory } from './reconcileChallengeMemory'
import { reconcileStudyLogMemory } from './reconcileStudyLogMemory'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memTraces } from '@/server/db/memory-schema'
import type { MemoryReconciliationResult } from '@/types/memoryTypes'

const RECONCILIATION_VERSION = 3
const RECONCILIATION_RUN_ID = `learning-feed-v${RECONCILIATION_VERSION}`

export async function reconcileStudentMemory(
  userId: string,
  force = false
): Promise<MemoryReconciliationResult> {
  try {
    const [existing] = await db
      .select({ traceId: memTraces.traceId })
      .from(memTraces)
      .where(and(eq(memTraces.userId, userId), eq(memTraces.runId, RECONCILIATION_RUN_ID)))
      .limit(1)
    if (existing && !force) return { attempted: false, complete: true }

    const results = await Promise.all([
      reconcileQuizMemory(userId),
      reconcileDiagnozyMemory(userId),
      reconcileChallengeMemory(userId),
      reconcileStudyLogMemory(userId),
    ])
    if (results.some((result) => !result)) {
      return { attempted: true, complete: false }
    }

    await db.transaction(async (tx) => {
      const lockKey = `${userId}:${RECONCILIATION_RUN_ID}`
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`)
      await tx.delete(memTraces).where(
        and(eq(memTraces.userId, userId), eq(memTraces.runId, RECONCILIATION_RUN_ID))
      )
      await tx.insert(memTraces).values({
        runId: RECONCILIATION_RUN_ID,
        userId,
        turnIndex: 0,
        eventType: 'promotion',
        payload: {
          version: RECONCILIATION_VERSION,
          sources: ['quiz', 'diagnozy', 'challenge', 'study_log'],
        },
      })
    })
    return { attempted: true, complete: true }
  } catch (error) {
    console.error('[memory] reconcileStudentMemory failed:', error)
    return { attempted: true, complete: false }
  }
}
