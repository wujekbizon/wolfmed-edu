import 'server-only'

import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { testSessions } from '@/server/db/schema'
import { SavePracticeProgressSchema } from '@/server/schema'

export async function persistPracticeProgress(userId: string, input: unknown) {
  const parsed = SavePracticeProgressSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, message: 'Nieprawidłowy postęp testu.' }

  const { sessionId, answers } = parsed.data
  const session = await db.query.testSessions.findFirst({
    where: and(
      eq(testSessions.id, sessionId),
      eq(testSessions.userId, userId),
      eq(testSessions.mode, 'PRACTICE'),
      eq(testSessions.status, 'ACTIVE')
    ),
    columns: { questionIds: true },
  })
  if (!session) return { success: false as const, message: 'Test próbny nie jest aktywny.' }
  if (Object.keys(answers).some((questionId) => !session.questionIds.includes(questionId))) {
    return { success: false as const, message: 'Nieprawidłowe pytanie w postępie.' }
  }

  const updated = await db.update(testSessions).set({
    progress: sql`${testSessions.progress} || ${JSON.stringify(answers)}::jsonb`,
    lastActivityAt: new Date(),
  }).where(and(
    eq(testSessions.id, sessionId),
    eq(testSessions.userId, userId),
    eq(testSessions.mode, 'PRACTICE'),
    eq(testSessions.status, 'ACTIVE')
  )).returning({ id: testSessions.id })
  return updated.length
    ? { success: true as const }
    : { success: false as const, message: 'Test próbny nie jest aktywny.' }
}
