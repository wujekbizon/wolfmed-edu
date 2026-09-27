import 'server-only'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { JEV_STREAK_IDLE_MS, JEV_STREAK_LENGTH } from '@/constants/jev'
import { summarizePracticeStreak } from '@/helpers/summarizePracticeStreak'
import { learningPracticeEvents } from '@/server/db/schema'
import type { PracticeItem } from '@/types/learningPracticeTypes'
import type { PracticeTransaction } from '@/types/learningPracticeServerTypes'
import type { PracticeObservation, PracticeStreakEvidence } from '@/types/learningObservationTypes'

export async function getPracticeStreakEvidence(
  tx: PracticeTransaction, sessionId: string, item: PracticeItem, includePendingEvent = false,
): Promise<PracticeStreakEvidence | null> {
  const trigger = item.learningEventId
  const last = item.attempts.at(-1)
  if (!trigger || !last || item.attempts.length !== 1 || last.correct !== false || item.revealed) return null
  const rows = await tx.select({
    eventId: learningPracticeEvents.eventId, questionId: learningPracticeEvents.questionId,
    revision: learningPracticeEvents.questionRevision, kind: learningPracticeEvents.type,
    at: learningPracticeEvents.createdAt, payload: learningPracticeEvents.payload,
  }).from(learningPracticeEvents).where(and(
    eq(learningPracticeEvents.sessionId, sessionId),
    inArray(learningPracticeEvents.type, [
      'answer_submitted', 'answer_revealed', 'hint_opened', 'comparison_opened',
      'tutor_answered', 'question_skipped', 'question_advanced', 'support_accepted', 'support_dismissed',
    ]),
  )).orderBy(desc(learningPracticeEvents.ordinal)).limit(96)
  const events: PracticeObservation[] = rows.map((row) => ({
    eventId: row.eventId, questionId: row.questionId, revision: row.revision,
    kind: row.kind, at: row.at.toISOString(), attempt: Number(row.payload.attempts ?? 0),
    correct: typeof row.payload.correct === 'boolean' ? row.payload.correct : null,
    assisted: row.payload.assisted === true, revealed: row.payload.revealed === true,
  }))
  if (!events.some((event) => event.eventId === trigger)) {
    if (!includePendingEvent) return null
    events.unshift({
      eventId: trigger, questionId: item.id, revision: item.revision, kind: 'answer_submitted',
      at: new Date().toISOString(), attempt: 1, correct: false, assisted: last.assisted, revealed: false,
    })
  }
  const latest = events[0]
  if (!latest || latest.eventId !== trigger) return null
  if (Date.now() - Date.parse(latest.at) > JEV_STREAK_IDLE_MS) return null
  const evidence = summarizePracticeStreak(events)
  return evidence.consecutiveIncorrect === JEV_STREAK_LENGTH ? evidence : null
}
