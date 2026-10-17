import { JEV_STREAK_IDLE_MS } from '@/constants/jev'
import type { PracticeObservation, PracticeStreakEvidence } from '@/types/learningObservationTypes'

export function summarizePracticeStreak(events: PracticeObservation[]): PracticeStreakEvidence {
  const seen = new Set<string>()
  const results: PracticeStreakEvidence['firstAttemptResultsOldestFirst'] = []
  let previousAt: number | null = null
  for (const event of events) {
    if (event.kind === 'progress_reset' || event.kind === 'question_review_started') break
    const at = Date.parse(event.at)
    if (!Number.isFinite(at) || (previousAt !== null && previousAt - at > JEV_STREAK_IDLE_MS)) break
    previousAt = at
    if (event.kind !== 'answer_submitted' || event.attempt !== 1 || !event.questionId || !event.revision) continue
    const key = `${event.questionId}:${event.revision}`
    if (seen.has(key)) continue
    seen.add(key)
    if (event.correct === null) break
    results.push({ result: event.correct ? 'correct' : 'incorrect', assisted: event.assisted })
    if (event.correct || results.length === 4) break
  }
  const consecutiveIncorrect = results.filter((entry) => entry.result === 'incorrect').length
  return { scope: 'current_run_since_last_30_minute_gap',
    consecutiveIncorrect, firstAttemptResultsOldestFirst: results.reverse() }
}
