import 'server-only'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeSessions } from '@/server/db/schema'
import { PRACTICE_POLICY_VERSION } from '@/constants/learningPractice'
import { buildPracticeView } from './buildView'

export async function readPracticeSession(userId: string, category: string) {
  return db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.userId, userId), eq(learningPracticeSessions.category, category),
      inArray(learningPracticeSessions.status, ['active', 'completed', 'abandoned']),
      eq(learningPracticeSessions.policyVersion, PRACTICE_POLICY_VERSION),
    )).orderBy(desc(learningPracticeSessions.startedAt)).limit(1)
    return session ? buildPracticeView(tx, session) : null
  })
}
