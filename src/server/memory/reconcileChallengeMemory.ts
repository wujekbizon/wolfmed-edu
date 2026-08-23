import 'server-only'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { challengeCompletions, procedures } from '@/server/db/schema'
import { onChallengeCompleted } from './extractChallenge'

export async function reconcileChallengeMemory(userId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({
        id: challengeCompletions.id,
        procedureId: challengeCompletions.procedureId,
        challengeType: challengeCompletions.challengeType,
        score: challengeCompletions.score,
        attempts: challengeCompletions.attempts,
        procedureData: procedures.data,
      })
      .from(challengeCompletions)
      .leftJoin(
        procedures,
        sql`${procedures.id}::text = ${challengeCompletions.procedureId}`
      )
      .where(eq(challengeCompletions.userId, userId))
      .orderBy(desc(challengeCompletions.completedAt))
      .limit(50)

    const latestByProcedure = new Map<string, (typeof rows)[number]>()
    for (const row of rows) {
      if (!latestByProcedure.has(row.procedureId)) {
        latestByProcedure.set(row.procedureId, row)
      }
    }

    await Promise.all(
      [...latestByProcedure.values()].slice(0, 12).map((row) => {
        const data = row.procedureData as { name?: string } | null
        return onChallengeCompleted({
          userId,
          completionId: row.id,
          procedureId: row.procedureId,
          procedureName: data?.name ?? row.procedureId,
          challengeType: row.challengeType,
          currentScore: row.score,
          attempts: row.attempts,
          embed: false,
        })
      })
    )
    return true
  } catch (error) {
    console.error('[memory] reconcileChallengeMemory failed:', error)
    return false
  }
}
