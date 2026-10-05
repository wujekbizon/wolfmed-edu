import { JEV_REVEAL_LENGTH, JEV_STREAK_IDLE_MS } from '@/constants/jev'
import type { PracticeObservation, PracticeRevealEvidence } from '@/types/learningObservationTypes'

export function summarizePracticeReveals(events: PracticeObservation[]): PracticeRevealEvidence | null {
  const current = events[0]
  if (!current?.questionId || !current.revision ||
    current.kind !== 'answer_revealed' &&
    !(current.kind === 'answer_submitted' && current.attempt === 2 && current.revealed)) return null
  const currentAt = Date.parse(current.at)
  if (!Number.isFinite(currentAt)) return null
  const currentKey = `${current.questionId}:${current.revision}`
  const seen = new Set<string>()
  for (const event of events) {
    if (event.kind === 'progress_reset' || event.kind === 'question_review_started') break
    const at = Date.parse(event.at)
    if (!Number.isFinite(at) || currentAt - at > JEV_STREAK_IDLE_MS) break
    const reveal = event.kind === 'answer_revealed' ||
      event.kind === 'answer_submitted' && event.attempt === 2 && event.revealed
    if (!reveal || !event.questionId || !event.revision) continue
    const key = `${event.questionId}:${event.revision}`
    if (seen.has(key) && key === currentKey) return null
    seen.add(key)
    if (seen.size > JEV_REVEAL_LENGTH) break
  }
  return seen.size === JEV_REVEAL_LENGTH
    ? { scope: 'current_run_last_30_minutes', distinctRevealedCards: seen.size } : null
}
