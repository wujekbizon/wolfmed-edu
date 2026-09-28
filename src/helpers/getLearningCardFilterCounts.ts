import type { LearningCardFilterCounts } from '@/types/learningUiTypes'
import type { LearningQuestionCardData, PracticeCardProgress } from '@/types/learningPracticeTypes'

export function getLearningCardFilterCounts(questions: LearningQuestionCardData[],
  progress: Map<string, PracticeCardProgress>): LearningCardFilterCounts {
  const counts: LearningCardFilterCounts = { all: questions.length, new: 0, review: 0, mastered: 0 }
  for (const question of questions) {
    const card = progress.get(`${question.id}:${question.revision}`)
    if (!card || (!card.priorExposure && !card.attempts && !card.hintOpened && !card.resolved)) counts.new++
    if (card?.outcome === 'unassisted') counts.mastered++
    if (card && (card.correct === false || card.hintOpened || card.outcome === 'assisted' || card.outcome === 'revealed' ||
      card.outcome === 'skipped' || card.outcome === 'invalid')) counts.review++
  }
  return counts
}
