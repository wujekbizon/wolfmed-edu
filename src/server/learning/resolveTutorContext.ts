import 'server-only'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeSessions } from '@/server/db/schema'
import { requireCategoryAccess } from './requireCategoryAccess'
import { isPracticeEnabled } from './config'
import { loadPracticeQuestion } from './loadQuestion'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import { getPracticeItem } from './getPracticeItems'
import type { PracticeReference } from '@/types/learningPracticeTypes'

export async function resolvePracticeTutorContext(userId: string, reference: PracticeReference) {
  const [owned] = await db.select().from(learningPracticeSessions).where(and(
    eq(learningPracticeSessions.id, reference.sessionId), eq(learningPracticeSessions.userId, userId),
  )).limit(1)
  if (!owned || !isPracticeEnabled(owned.category) || process.env.LEARNING_PRACTICE_TUTOR_ENABLED !== 'true') {
    throw new Error('Pomoc do tej sesji jest niedostępna.')
  }
  await requireCategoryAccess(owned.category)
  return db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, reference.sessionId), eq(learningPracticeSessions.userId, userId),
    )).for('share')
    const current = session ? await getPracticeItem(tx, session, reference.questionId) : null
    const item = current?.item
    if (!session || !item || item.revision !== reference.questionRevision) throw new Error('Nieaktualne pytanie.')
    const attempt = item.attempts.find((entry) => entry.eventId === reference.attemptId)
    if (reference.attemptId && !attempt) throw new Error('Nieprawidłowa próba.')
    if (!item.revealed && !item.attempts.some((entry) => entry.correct)) {
      throw new Error('Najpierw pokaż odpowiedź. Wyjaśnienie ujawnia rozwiązanie.')
    }
    const question = await loadPracticeQuestion(tx, item.id, session.category)
    if (!question || question.revision !== item.revision) throw new Error('Treść pytania uległa zmianie.')
    const support = getReviewedPracticeSupport(item.id, item.revision, session.catalogVersion)
    return {
      searchTopic: support?.topic || question.data.question,
      context: JSON.stringify({
        question: question.data.question,
        options: question.data.answers.map((answer, index) => ({ label: String.fromCharCode(65 + index), text: answer.option })),
        storedKey: String.fromCharCode(65 + question.data.answers.findIndex((answer) => answer.isCorrect)),
        selected: attempt ? String.fromCharCode(65 + attempt.selected) : null,
        correct: attempt?.correct ?? null, hintOpened: item.hintOpened, revealed: item.revealed,
        questionNumber: current!.position + 1, category: session.category,
      }),
    }
  })
}
