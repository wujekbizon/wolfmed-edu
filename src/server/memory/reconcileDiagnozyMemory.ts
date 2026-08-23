import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { diagnozyExamAttempts } from '@/server/db/schema'
import { onDiagnozyExamCompleted } from './extractDiagnozy'

export async function reconcileDiagnozyMemory(userId: string): Promise<boolean> {
  try {
    const attempts = await db
      .select({
        id: diagnozyExamAttempts.id,
        diagnozaSlug: diagnozyExamAttempts.diagnozaSlug,
      })
      .from(diagnozyExamAttempts)
      .where(eq(diagnozyExamAttempts.userId, userId))
      .orderBy(desc(diagnozyExamAttempts.completedAt))
      .limit(50)

    const latestByDiagnosis = new Map<string, string>()
    for (const attempt of attempts) {
      if (!latestByDiagnosis.has(attempt.diagnozaSlug)) {
        latestByDiagnosis.set(attempt.diagnozaSlug, attempt.id)
      }
    }

    await Promise.all(
      [...latestByDiagnosis.entries()].slice(0, 12).map(([diagnozaSlug, attemptId]) =>
        onDiagnozyExamCompleted({
          userId,
          attemptId,
          diagnozaSlug,
          embed: false,
        })
      )
    )
    return true
  } catch (error) {
    console.error('[memory] reconcileDiagnozyMemory failed:', error)
    return false
  }
}
