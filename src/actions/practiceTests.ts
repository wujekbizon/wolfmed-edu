'use server'

import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { testSessions, users } from '@/server/db/schema'
import { StartPracticeTestSchema } from '@/server/schema'
import { hasPracticeCategoryAccess } from '@/server/hasPracticeCategoryAccess'
import { getPracticeQuestionIds } from '@/server/practiceQuestionQueries'
import { checkRateLimit } from '@/lib/rateLimit'

export async function startPracticeTestAction(category: string, numberOfQuestions: number) {
  const { userId } = await auth()
  if (!userId) return { success: false as const, message: 'Zaloguj się, aby rozpocząć test.' }
  const rateLimit = await checkRateLimit(userId, 'test:practice:start')
  if (!rateLimit.success) return { success: false as const, message: 'Spróbuj ponownie później.' }

  const parsed = StartPracticeTestSchema.safeParse({ category, numberOfQuestions })
  if (!parsed.success) return { success: false as const, message: 'Nieprawidłowe dane testu.' }
  try {
    if (!(await hasPracticeCategoryAccess(userId, category))) {
      return { success: false as const, message: 'Nie masz dostępu do tej kategorii.' }
    }
    const existing = await findActivePractice(userId, category, parsed.data.numberOfQuestions)
    if (existing) return { success: true as const, sessionId: existing.id }
    const id = crypto.randomUUID()
    const questions = await getPracticeQuestionIds(userId, category, parsed.data.numberOfQuestions, id)
    if (questions.length !== parsed.data.numberOfQuestions) {
      return { success: false as const, message: 'Za mało pytań w tej kategorii.' }
    }
    const sessionId = await createOrResumePractice({ userId, category, numberOfQuestions: parsed.data.numberOfQuestions, id, questionIds: questions.map((question) => question.id) })
    return { success: true as const, sessionId }
  } catch (error) {
    return { success: false as const, message: error instanceof Error ? error.message : 'Nie udało się rozpocząć testu.' }
  }
}

async function findActivePractice(userId: string, category: string, count: number) {
  return db.query.testSessions.findFirst({ where: and(
    eq(testSessions.userId, userId), eq(testSessions.category, category),
    eq(testSessions.numberOfQuestions, count), eq(testSessions.mode, 'PRACTICE'),
    eq(testSessions.status, 'ACTIVE')
  ), columns: { id: true } })
}

async function createOrResumePractice(input: {
  userId: string
  category: string
  numberOfQuestions: number
  id: string
  questionIds: string[]
}) {
  return db.transaction(async (tx) => {
    await tx.select({ userId: users.userId }).from(users).where(eq(users.userId, input.userId)).for('update')
    const existing = await tx.query.testSessions.findFirst({ where: and(
      eq(testSessions.userId, input.userId), eq(testSessions.category, input.category),
      eq(testSessions.numberOfQuestions, input.numberOfQuestions), eq(testSessions.mode, 'PRACTICE'),
      eq(testSessions.status, 'ACTIVE')
    ), columns: { id: true } })
    if (existing) return existing.id

    const now = new Date()
    await tx.insert(testSessions).values({
      id: input.id, userId: input.userId, category: input.category,
      numberOfQuestions: input.numberOfQuestions, durationMinutes: 0,
      startedAt: now, expiresAt: now, lastActivityAt: now,
      status: 'ACTIVE', mode: 'PRACTICE', questionIds: input.questionIds,
    })
    return input.id
  })
}
