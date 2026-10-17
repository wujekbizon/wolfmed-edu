import 'server-only'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeSessions } from '@/server/db/schema'
import { onPracticeActivity } from './extractPractice'

export async function reconcilePracticeMemory(userId: string): Promise<boolean> {
  try {
    const rows = await db.select({ category: learningPracticeSessions.category })
      .from(learningPracticeSessions).where(eq(learningPracticeSessions.userId, userId))
      .orderBy(desc(learningPracticeSessions.startedAt)).limit(24)
    for (const category of new Set(rows.map((row) => row.category))) {
      if (!await onPracticeActivity(userId, category)) return false
    }
    return true
  } catch (error) {
    console.error('[memory] reconcilePracticeMemory failed:', error)
    return false
  }
}
