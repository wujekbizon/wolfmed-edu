import type { PracticeFormState } from '@/types/learningPracticeTypes'
import type { PracticeQuestionCardProps } from '@/types/learningUiTypes'

export function deliverPracticeFormResult(
  state: PracticeFormState, callbacks: Pick<PracticeQuestionCardProps, 'onSaved' | 'onAnswered'>,
  submittedEventId: string | null, answeredEventId: string | null,
): string | null {
  if (!state.session) return answeredEventId
  callbacks.onSaved(state.session)
  const question = state.session.question
  if (state.status !== 'SUCCESS' || !question?.attemptId ||
    question.attemptId !== submittedEventId || question.attemptId === answeredEventId) return answeredEventId
  callbacks.onAnswered(question)
  return question.attemptId
}
