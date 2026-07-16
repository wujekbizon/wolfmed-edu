import type {
  AiChallengeType,
  GeneratedQuizData,
} from '@/types/generatedQuizTypes'

/**
 * Stamps stable ids onto AI-generated quiz items (the model is not trusted to
 * produce unique ids). Ids are positional — the stored quiz is immutable.
 */
export function withQuizItemIds(
  challengeType: AiChallengeType,
  data: Record<string, unknown>
): GeneratedQuizData {
  if (challengeType === 'knowledge-quiz') {
    const questions = (data.questions as Array<Record<string, unknown>>).map(
      (question, index) => ({ ...question, id: `q-${index}` })
    )
    return { ...data, questions } as GeneratedQuizData
  }

  if (challengeType === 'spot-error') {
    const steps = (data.steps as Array<Record<string, unknown>>).map(
      (step, index) => ({ ...step, id: `step-${index}` })
    )
    return { ...data, steps } as GeneratedQuizData
  }

  return data as unknown as GeneratedQuizData
}
