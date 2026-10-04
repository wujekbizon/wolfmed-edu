import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeSessions, tests } from '@/server/db/schema'
import { getPracticeItem } from '@/server/learning/getPracticeItems'
import { loadPracticeQuestion } from '@/server/learning/loadQuestion'
import { hasPracticeReviewCard } from '@/server/learning/hasPracticeReviewCard'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import { PRACTICE_CATALOG_VERSION } from '@/constants/learningPractice'
import type { PracticeItem } from '@/types/learningPracticeTypes'
import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'

export async function loadWolfekPracticeCard(userId: string, ref: WolfekPracticeReference) {
  return db.transaction(async (tx) => {
    const question = await loadPracticeQuestion(tx, ref.questionId, ref.category)
    if (!question || question.revision !== ref.revision) throw new WolfekQuestionError('Treść pytania uległa zmianie.')
    if (ref.selected != null && !question.data.answers[ref.selected]) throw new WolfekQuestionError('Nieprawidłowy wybór odpowiedzi.')
    if (!ref.sessionId) {
      const [count] = await tx.select({ total: sql<number>`count(*)::int`,
        remaining: sql<number>`count(*) FILTER (WHERE ${tests.id} > ${ref.questionId}::uuid)::int` }).from(tests)
        .where(sql`${tests.meta}->>'category' = ${ref.category}`)
      const item: PracticeItem = { id: ref.questionId, revision: ref.revision, attempts: [],
        hintOpened: false, revealed: false, priorExposure: false, version: 0, outcome: null }
      return { item, position: 0, total: Number(count?.total ?? 0), question: question.data,
        support: getReviewedPracticeSupport(ref.questionId, ref.revision, PRACTICE_CATALOG_VERSION),
        reviewAvailable: false, canContinue: Number(count?.remaining ?? 0) > 0 }
    }
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, ref.sessionId), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, ref.category),
    )).limit(1)
    if (!session || session.version !== ref.version || session.status !== 'active') throw new WolfekQuestionError('Sesja uległa zmianie. Zapytaj ponownie.')
    const current = await getPracticeItem(tx, session, ref.questionId)
    if (!current || current.item.revision !== ref.revision) throw new WolfekQuestionError('Ta karta jest nieaktualna.')
    return { item: current.item, position: current.position, total: session.items.length,
      question: question.data, support: getReviewedPracticeSupport(current.item.id, current.item.revision, session.catalogVersion),
      reviewAvailable: await hasPracticeReviewCard(tx, session, current.item.id),
      canContinue: current.position + 1 < session.items.length }
  })
}
