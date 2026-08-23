import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions } from '@/server/db/schema'
import { onQuizCompleted } from './extract'

export async function reconcileQuizMemory(userId: string): Promise<boolean> {
  try {
    const rows = await db
      .select({ sessionId: completedTestes.sessionId, category: testSessions.category })
      .from(completedTestes)
      .innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(eq(completedTestes.userId, userId))
      .orderBy(desc(completedTestes.completedAt))
      .limit(50)

    const latestByCategory = new Map<string, string>()
    for (const row of rows) {
      if (row.sessionId && !latestByCategory.has(row.category)) {
        latestByCategory.set(row.category, row.sessionId)
      }
    }

    await Promise.all(
      [...latestByCategory.entries()].slice(0, 12).map(([category, sessionId]) =>
        onQuizCompleted({ userId, sessionId, category, embed: false })
      )
    )
    return true
  } catch (error) {
    console.error('[memory] reconcileQuizMemory failed:', error)
    return false
  }
}
