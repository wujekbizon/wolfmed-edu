import 'server-only'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { JEV_STREAK_IDLE_MS, JEV_STREAK_LENGTH } from '@/constants/jev'
import { summarizePracticeStreak } from '@/helpers/summarizePracticeStreak'
import { summarizePracticePriorHelp } from '@/helpers/summarizePracticePriorHelp'
import { summarizePracticeReveals } from '@/helpers/summarizePracticeReveals'
import { learningPracticeEvents } from '@/server/db/schema'
import type { PracticeItem } from '@/types/learningPracticeTypes'
import type { PracticeTransaction } from '@/types/learningPracticeServerTypes'
import type { PracticeCoachingEvidence, PracticeObservation } from '@/types/learningObservationTypes'

export async function getPracticeCoachingEvidence(
  tx: PracticeTransaction, sessionId: string, item: PracticeItem, includePendingEvent = false,
): Promise<PracticeCoachingEvidence | null> {
  const trigger = item.learningEventId
  const last = item.attempts.at(-1)
  const firstWrong = item.outcome === null && item.attempts.length === 1 && last?.correct === false && !item.revealed
  const revealed = item.outcome === 'revealed' && item.revealed
  if (!trigger || !firstWrong && !revealed) return null
  const rows = await tx.select({
    eventId: learningPracticeEvents.eventId, questionId: learningPracticeEvents.questionId,
    revision: learningPracticeEvents.questionRevision, kind: learningPracticeEvents.type,
    at: learningPracticeEvents.createdAt, payload: learningPracticeEvents.payload,
  }).from(learningPracticeEvents).where(and(
    eq(learningPracticeEvents.sessionId, sessionId),
    inArray(learningPracticeEvents.type, [
      'answer_submitted', 'answer_revealed', 'hint_opened', 'comparison_opened',
      'tutor_answered', 'question_skipped', 'question_advanced', 'support_accepted', 'support_dismissed',
      'progress_reset', 'question_review_started',
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
    const submitted = last?.eventId === trigger
    events.unshift({
      eventId: trigger, questionId: item.id, revision: item.revision,
      kind: submitted ? 'answer_submitted' : 'answer_revealed',
      at: new Date().toISOString(), attempt: item.attempts.length,
      correct: submitted ? last?.correct ?? null : null,
      assisted: submitted ? last?.assisted ?? false : false, revealed: item.revealed,
    })
  }
  const latest = events[0]
  if (!latest || latest.eventId !== trigger) return null
  if (Date.now() - Date.parse(latest.at) > JEV_STREAK_IDLE_MS) return null
  const learningWindow = summarizePracticeStreak(events)
  if (revealed) {
    const revealWindow = summarizePracticeReveals(events)
    return revealWindow ? { trigger: 'frequent_reveals', learningWindow, priorHelp: null, revealWindow } : null
  }
  const priorHelp = summarizePracticePriorHelp(events)
  if (!priorHelp && learningWindow.consecutiveIncorrect !== JEV_STREAK_LENGTH) return null
  return { trigger: priorHelp ? 'difficulty_after_help' : 'three_distinct_first_errors',
    learningWindow, priorHelp, revealWindow: null }
}
