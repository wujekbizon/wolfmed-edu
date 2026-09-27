import type { LearningCardFilter } from '@/types/learningUiTypes'
import type { LearningQuestionCardData, PracticeCardProgress } from '@/types/learningPracticeTypes'

export function filterLearningCards(questions: LearningQuestionCardData[], term: string, filter: LearningCardFilter,
  progress: Map<string, PracticeCardProgress>) {
  const needle = term.trim().toLocaleLowerCase()
  return questions.filter((question) => {
    const matchesTerm = !needle || [question.question, ...question.options]
      .some((text) => text.toLocaleLowerCase().includes(needle))
    if (!matchesTerm) return false
    const card = progress.get(`${question.id}:${question.revision}`)
    if (filter === 'all') return true
    if (filter === 'new') return !card || (!card.priorExposure && !card.attempts && !card.hintOpened && !card.resolved)
    if (filter === 'mastered') return card?.outcome === 'unassisted'
    return Boolean(card && (card.priorExposure || card.correct === false || card.hintOpened || card.outcome === 'assisted' ||
      card.outcome === 'revealed' || card.outcome === 'skipped' || card.outcome === 'invalid'))
  })
}
