import type { PracticeCommand, PracticeFormState } from '@/types/learningPracticeTypes'

export const PRACTICE_CATEGORY = 'opiekun-medyczny'
export const PRACTICE_POLICY_VERSION = 'card-deck-v2'
export const PRACTICE_CATALOG_VERSION = 'reviewed-v1'
export const PRACTICE_STALE_TIME = 30_000
export const PRACTICE_EVENT_TYPES: Record<PracticeCommand, string> = {
  answer: 'answer_submitted', hint: 'hint_opened', reveal: 'answer_revealed',
  skip: 'question_skipped', next: 'question_advanced', finish: 'session_finished',
}
export const EMPTY_PRACTICE_STATE: PracticeFormState = {
  status: 'UNSET', message: '', fieldErrors: {}, timestamp: 0, session: null,
}
