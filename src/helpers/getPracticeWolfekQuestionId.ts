import type { PracticeView } from '@/types/learningPracticeTypes'

export function getPracticeWolfekQuestionId(session: PracticeView | null) {
  const question = session?.question
  const action = question?.suggestedAction
  if (action === 'tutor') return question?.correctIndex === null ? 'reveal_tutor' : 'ask_tutor'
  if (action === 'review') return 'review'
  if (action === 'continue') return 'next'
  if (action === 'material') return 'material'
  if (action === 'plan') return 'plan'
  return 'accept_suggestion'
}
