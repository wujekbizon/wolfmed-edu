import 'server-only'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions } from '@/server/db/schema'

export async function getWolfekTestCountFacts(userId: string) {
  try {
    const [row] = await db.select({ count: sql<number>`count(*)::int` })
      .from(completedTestes).innerJoin(testSessions, eq(completedTestes.sessionId, testSessions.id))
      .where(eq(completedTestes.userId, userId))
    const count = row ? Number(row.count) : null
    return { completedTestCount: count, hasTests: count === null ? null : count > 0 }
  } catch {
    return { completedTestCount: null, hasTests: null }
  }
}
