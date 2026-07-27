import type { ExamAttemptSortKey, ExamAttemptStatusFilter } from '@/types/diagnozyTypes'

export const ATTEMPTS_PREVIEW_COUNT = 4

export const EXAM_ATTEMPT_SORT_LABELS: Record<ExamAttemptSortKey, string> = {
  'date-desc': 'Od najnowszych',
  'date-asc': 'Od najstarszych',
  'score-desc': 'Najwyższy wynik',
  'score-asc': 'Najniższy wynik',
}

export const EXAM_ATTEMPT_STATUS_LABELS: Record<ExamAttemptStatusFilter, string> = {
  all: 'Wszystkie',
  passed: 'Zaliczone',
  failed: 'Niezaliczone',
}

/** History depth fetched for the panel; the preview shows the newest few. */
export const ATTEMPTS_HISTORY_LIMIT = 50
