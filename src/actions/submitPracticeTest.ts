'use server'

import { auth } from '@clerk/nextjs/server'
import { after } from 'next/server'
import { revalidatePath } from 'next/cache'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { completedTestes, testSessions, users } from '@/server/db/schema'
import { toFormState, fromErrorToFormState } from '@/helpers/toFormState'
import { getPracticeSessionQuestions } from '@/server/testSessionQuestions'
import { gradeSessionAnswers } from '@/helpers/gradeSessionAnswers'
import { checkRateLimit } from '@/lib/rateLimit'
import { getFormStringValues } from '@/helpers/getFormStringValues'
import { PracticeSessionIdSchema } from '@/server/schema'
import { onQuizCompleted } from '@/server/memory/extract'
import type { FormState } from '@/types/actionTypes'

export async function submitPracticeTestAction(_state: FormState, formData: FormData) {
  const { userId } = await auth()
  if (!userId) return toFormState('ERROR', 'Zaloguj się ponownie.')
  const rateLimit = await checkRateLimit(userId, 'test:practice:submit')
  if (!rateLimit.success) return toFormState('ERROR', 'Spróbuj ponownie później.')

  const submitted = getFormStringValues(formData)
  const parsedSessionId = PracticeSessionIdSchema.safeParse(submitted.sessionId)
  if (!parsedSessionId.success) return toFormState('ERROR', 'Brak identyfikatora testu.')
  const sessionId = parsedSessionId.data
  const answers = Object.fromEntries(Object.entries(submitted).filter(
    (entry): entry is [string, string] => entry[0].startsWith('answer-') && typeof entry[1] === 'string'
  ))
  const session = await db.query.testSessions.findFirst({
    where: and(
      eq(testSessions.id, sessionId),
      eq(testSessions.userId, userId),
      eq(testSessions.mode, 'PRACTICE'),
      eq(testSessions.status, 'ACTIVE')
    ),
    columns: { category: true, questionIds: true },
  })
  if (!session) return toFormState('ERROR', 'Nie znaleziono aktywnego testu próbnego.')

  const questions = await getPracticeSessionQuestions(userId, session.category, session.questionIds, sessionId)
  if (questions.length !== session.questionIds.length) {
    return toFormState('ERROR', 'Pytania tego testu nie są już dostępne.')
  }
  const grade = gradeSessionAnswers(questions, answers)
  if (!grade.success) return toFormState('ERROR', grade.message)

  try {
    await db.transaction(async (tx) => {
      const [locked] = await tx.select({ id: testSessions.id }).from(testSessions).where(and(
        eq(testSessions.id, sessionId),
        eq(testSessions.userId, userId),
        eq(testSessions.mode, 'PRACTICE'),
        eq(testSessions.status, 'ACTIVE')
      )).for('update')
      if (!locked) throw new Error('Test próbny został już zakończony.')

      await tx.update(users).set({
        testsAttempted: sql`${users.testsAttempted} + 1`,
        totalScore: sql`${users.totalScore} + ${grade.correct}`,
        totalQuestions: sql`${users.totalQuestions} + ${grade.testResult.length}`,
      }).where(eq(users.userId, userId))
      await tx.insert(completedTestes).values({
        userId,
        sessionId,
        score: grade.correct,
        testResult: grade.testResult,
      })
      await tx.update(testSessions).set({ status: 'COMPLETED', finishedAt: new Date(), progress: {} })
        .where(eq(testSessions.id, sessionId))
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  after(() => onQuizCompleted({ userId, sessionId, category: session.category }))
  revalidatePath('/panel', 'page')
  return toFormState('SUCCESS', `Wynik: ${grade.correct} / ${grade.testResult.length}`)
}
