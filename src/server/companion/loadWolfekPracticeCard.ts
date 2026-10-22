import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { and, eq, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeItems, learningPracticeSessions } from '@/server/db/schema'
import { loadPracticeQuestion } from '@/server/learning/loadQuestion'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import { PRACTICE_CATALOG_VERSION } from '@/constants/learningPractice'
import type { PracticeItem } from '@/types/learningPracticeTypes'
import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'
import type { WolfekPracticeCardSnapshot } from '@/types/wolfekPracticeServerTypes'

export async function loadWolfekPracticeCard(userId: string, ref: WolfekPracticeReference): Promise<WolfekPracticeCardSnapshot> {
  return db.transaction(async (tx) => {
    const question = await loadPracticeQuestion(tx, ref.questionId, ref.category)
    if (!question || question.revision !== ref.revision) throw new WolfekQuestionError('Treść pytania uległa zmianie.')
    if (ref.selected != null && !question.data.answers[ref.selected]) throw new WolfekQuestionError('Nieprawidłowy wybór odpowiedzi.')
    if (!ref.sessionId) {
      const item: PracticeItem = { id: ref.questionId, revision: ref.revision, attempts: [],
        hintOpened: false, revealed: false, priorExposure: false, version: 0, outcome: null }
      return { item, question: question.data,
        support: getReviewedPracticeSupport(ref.questionId, ref.revision, PRACTICE_CATALOG_VERSION) }
    }
    const [session] = await tx.select({ version: learningPracticeSessions.version,
      status: learningPracticeSessions.status, catalogVersion: learningPracticeSessions.catalogVersion,
      item: sql<PracticeItem | null>`(SELECT value FROM jsonb_array_elements(${learningPracticeSessions.items})
        WHERE value->>'id' = ${ref.questionId} LIMIT 1)`,
    }).from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, ref.sessionId), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, ref.category),
    )).limit(1)
    if (!session || session.version !== ref.version || session.status !== 'active') throw new WolfekQuestionError('Sesja uległa zmianie. Zapytaj ponownie.')
    if (!session.item) throw new WolfekQuestionError('Ta karta jest nieaktualna.')
    const [saved] = await tx.select({ item: learningPracticeItems.item }).from(learningPracticeItems).where(and(
      eq(learningPracticeItems.sessionId, ref.sessionId), eq(learningPracticeItems.questionId, ref.questionId),
    )).limit(1)
    const item = saved?.item ?? session.item
    if (item.revision !== ref.revision) throw new WolfekQuestionError('Ta karta jest nieaktualna.')
    return { item, question: question.data,
      support: getReviewedPracticeSupport(item.id, item.revision, session.catalogVersion) }
  })
}
