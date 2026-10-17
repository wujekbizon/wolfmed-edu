import { JEV_STREAK_IDLE_MS } from '@/constants/jev'
import type { PracticeObservation, PracticePriorHelpEvidence } from '@/types/learningObservationTypes'

export function summarizePracticePriorHelp(events: PracticeObservation[]): PracticePriorHelpEvidence | null {
  const boundary = events.findIndex((event) => event.kind === 'progress_reset' || event.kind === 'question_review_started')
  const currentRun = boundary < 0 ? events : events.slice(0, boundary)
  const current = currentRun[0]
  if (!current || current.kind !== 'answer_submitted' || current.attempt !== 1 ||
    current.correct !== false || current.assisted || !current.questionId) return null
  const currentAt = Date.parse(current.at)
  if (!Number.isFinite(currentAt)) return null
  const previousIndex = currentRun.findIndex((event, index) => index > 0 &&
    event.kind === 'answer_submitted' && event.attempt === 1 &&
    event.questionId && event.questionId !== current.questionId)
  const previous = currentRun[previousIndex]
  if (!previous || previous.correct !== false || !previous.questionId || !previous.revision ||
    !Number.isFinite(Date.parse(previous.at)) ||
    currentAt - Date.parse(previous.at) > JEV_STREAK_IDLE_MS) return null
  const olderCardIndex = currentRun.findIndex((event, index) => index > previousIndex &&
    event.kind === 'answer_submitted' && event.attempt === 1 &&
    event.questionId && event.questionId !== previous.questionId)
  const window = currentRun.slice(1, olderCardIndex < 0 ? undefined : olderCardIndex)
  const help = window.find((event) => (event.kind === 'hint_opened' || event.kind === 'comparison_opened') &&
    event.questionId === previous.questionId && event.revision === previous.revision &&
    currentAt - Date.parse(event.at) <= JEV_STREAK_IDLE_MS)
  if (!help) return null
  return { kind: help.kind === 'hint_opened' ? 'hint' : 'compare',
    previousCardFirstAttempt: 'incorrect', currentCardFirstAttempt: 'incorrect', topicRelation: 'unknown' }
}
