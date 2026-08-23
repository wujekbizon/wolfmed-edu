import 'server-only'
import { and, eq, max, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memTraces } from '@/server/db/memory-schema'
import type {
  TutorModelTraceInput,
  TutorRetrievalTraceInput,
  TutorTraceContext,
} from '@/types/memoryTypes'

export async function startTutorTurnTrace(input: {
  runId: string
  userId: string
  question: string
}): Promise<TutorTraceContext | null> {
  try {
    return await db.transaction(async (tx) => {
      const lockKey = `${input.userId}:${input.runId}`
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`)
      const [current] = await tx
        .select({ turnIndex: max(memTraces.turnIndex) })
        .from(memTraces)
        .where(and(eq(memTraces.userId, input.userId), eq(memTraces.runId, input.runId)))
      const turnIndex = Number(current?.turnIndex ?? -1) + 1
      await tx.insert(memTraces).values({
        runId: input.runId,
        userId: input.userId,
        turnIndex,
        eventType: 'user_msg',
        payload: { text: input.question },
      })
      return { runId: input.runId, userId: input.userId, turnIndex }
    })
  } catch (error) {
    console.error('[memory] startTutorTurnTrace failed:', error)
    return null
  }
}

export async function recordTutorRetrievalTrace(
  input: TutorRetrievalTraceInput
): Promise<void> {
  try {
    await db.insert(memTraces).values({
      runId: input.runId,
      userId: input.userId,
      turnIndex: input.turnIndex,
      eventType: input.route === 'rag' ? 'rag_retrieval' : 'memory_retrieval',
      payload: {
        route: input.route,
        memoryStatus: input.memoryStatus,
        memoryCounts: input.memoryCounts,
        sources: input.sources,
      },
    })
  } catch (error) {
    console.error('[memory] recordTutorRetrievalTrace failed:', error)
  }
}

export async function recordTutorModelTrace(input: TutorModelTraceInput): Promise<void> {
  try {
    await db.insert(memTraces).values({
      runId: input.runId,
      userId: input.userId,
      turnIndex: input.turnIndex,
      eventType: 'model_msg',
      payload: {
        text: input.answer,
        ...(input.tokenUsage ? { usage: input.tokenUsage } : {}),
      },
      tokenCost: input.tokenUsage?.totalTokens ?? null,
      latencyMs: input.latencyMs,
    })
  } catch (error) {
    console.error('[memory] recordTutorModelTrace failed:', error)
  }
}
