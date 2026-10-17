import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions } from '@/server/db/schema'

export async function getRelevantQuizHistory(userId: string, category: string) {
  const rows = await db.select({
    score: completedTestes.score, total: testSessions.numberOfQuestions,
    recordedAt: completedTestes.completedAt,
  }).from(completedTestes).innerJoin(testSessions,
    eq(completedTestes.sessionId, testSessions.id))
    .where(and(eq(completedTestes.userId, userId), eq(testSessions.category, category)))
    .orderBy(desc(completedTestes.completedAt)).limit(3)
  if (!rows.length) return null
  const percentages = rows.map((row) => row.total ? row.score * 100 / row.total : 0)
  return { averagePercent: Math.round(percentages.reduce((sum, value) => sum + value, 0) / rows.length),
    attempts: rows.length, recordedAt: rows[0]!.recordedAt.toISOString() }
}

