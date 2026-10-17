import 'server-only'
import { and, desc, eq, gte, inArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { summarizePracticeObservations } from '@/helpers/summarizePracticeObservations'
import type { PaymentTransaction } from '@/types/dbTypes'
import type { PracticeObservation, PracticeObservationSummary } from '@/types/learningObservationTypes'

export async function getPracticeObservations(userId: string, category: string,
  executor: PaymentTransaction = db): Promise<PracticeObservationSummary> {
  const cutoff = new Date(Date.now() - 30 * 86400000)
  const rows = await executor.select({
    eventId: learningPracticeEvents.eventId, questionId: learningPracticeEvents.questionId,
    revision: learningPracticeEvents.questionRevision, kind: learningPracticeEvents.type,
    at: learningPracticeEvents.createdAt, payload: learningPracticeEvents.payload,
  }).from(learningPracticeEvents).innerJoin(learningPracticeSessions,
    eq(learningPracticeEvents.sessionId, learningPracticeSessions.id))
    .where(and(eq(learningPracticeSessions.userId, userId), eq(learningPracticeSessions.category, category),
      gte(learningPracticeEvents.createdAt, cutoff),
      inArray(learningPracticeEvents.type, ['answer_submitted', 'answer_revealed', 'hint_opened', 'comparison_opened', 'tutor_answered'])))
    .orderBy(desc(learningPracticeEvents.createdAt), desc(learningPracticeEvents.ordinal)).limit(120)
  const observations: PracticeObservation[] = rows.map((row) => {
    const outcome = row.payload.outcome
    const correct = row.kind === 'answer_submitted'
      ? typeof row.payload.correct === 'boolean' ? row.payload.correct
        : outcome === 'assisted' || outcome === 'unassisted' : null
    return { eventId: row.eventId, questionId: row.questionId, revision: row.revision,
      kind: row.kind, at: row.at.toISOString(), attempt: Number(row.payload.attempts ?? 0),
      correct, assisted: row.payload.assisted === true || outcome === 'assisted' ||
        row.payload.hintOpened === true, revealed: row.payload.revealed === true }
  })
  return summarizePracticeObservations(observations)
}
