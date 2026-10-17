import type { PracticeObservation, PracticeObservationSummary } from '@/types/learningObservationTypes'

export function summarizePracticeObservations(events: PracticeObservation[]): PracticeObservationSummary {
  const cards = new Set<string>()
  const result: PracticeObservationSummary = {
    cards: 0, firstCorrect: 0, firstWrong: 0, retries: 0, hints: 0, reveals: 0, comparisons: 0, tutorResponses: 0,
    lastEventId: events[0]?.eventId ?? null, lastAt: events[0]?.at ?? null,
    recent: events.slice(0, 6).map(({ kind, correct, assisted }) => ({ kind, correct, assisted })),
  }
  for (const event of events) {
    if (event.questionId && event.revision) cards.add(`${event.questionId}:${event.revision}`)
    if (event.kind === 'hint_opened') result.hints++
    if (event.kind === 'comparison_opened') result.comparisons++
    if (event.kind === 'tutor_answered') result.tutorResponses++
    if (event.kind === 'answer_revealed' ||
      (event.kind === 'answer_submitted' && event.attempt > 1 && event.revealed)) result.reveals++
    if (event.kind !== 'answer_submitted') continue
    if (event.attempt > 1) result.retries++
    if (event.attempt !== 1) continue
    if (event.correct && !event.assisted) result.firstCorrect++
    else if (!event.correct) result.firstWrong++
  }
  result.cards = cards.size
  return result
}
