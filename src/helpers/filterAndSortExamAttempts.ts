import type {
  DiagnozyExamAttempt,
  ExamAttemptCriteria,
} from '@/types/diagnozyTypes'

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function filterAndSortExamAttempts(
  attempts: DiagnozyExamAttempt[],
  titlesBySlug: Record<string, string>,
  criteria: ExamAttemptCriteria
): DiagnozyExamAttempt[] {
  const query = normalize(criteria.search.trim())

  const filtered = attempts.filter((attempt) => {
    if (criteria.status === 'passed' && !attempt.passed) return false
    if (criteria.status === 'failed' && attempt.passed) return false
    if (!query) return true

    const title = titlesBySlug[attempt.diagnozaSlug] ?? attempt.diagnozaSlug
    return normalize(title).includes(query)
  })

  switch (criteria.sort) {
    case 'date-asc':
      return filtered.sort(
        (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
      )
    case 'score-desc':
      return filtered.sort((a, b) => b.score - a.score)
    case 'score-asc':
      return filtered.sort((a, b) => a.score - b.score)
    default:
      return filtered.sort(
        (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
      )
  }
}
