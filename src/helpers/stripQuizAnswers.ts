import type {
  AiChallengeType,
  GeneratedKnowledgeQuiz,
  GeneratedQuizPlayView,
  GeneratedScenarioQuiz,
  GeneratedSpotErrorQuiz,
} from '@/types/generatedQuizTypes'

/**
 * Builds the client-safe play view of a stored quiz: correct answers,
 * isCorrect flags and explanations never leave the server before submission.
 */
export function stripQuizAnswers(row: {
  id: string
  procedureId: string
  challengeType: string
  quizJson: unknown
}): GeneratedQuizPlayView {
  const challengeType = row.challengeType as AiChallengeType
  const base = {
    quizId: row.id,
    procedureId: row.procedureId,
    challengeType,
  }

  if (challengeType === 'knowledge-quiz') {
    const quiz = row.quizJson as GeneratedKnowledgeQuiz
    return {
      ...base,
      procedureName: quiz.procedureName,
      questions: quiz.questions.map(({ id, question, options }) => ({
        id,
        question,
        options,
      })),
    }
  }

  if (challengeType === 'spot-error') {
    const quiz = row.quizJson as GeneratedSpotErrorQuiz
    return {
      ...base,
      procedureName: quiz.procedureName,
      steps: quiz.steps.map(({ id, step }) => ({ id, step })),
    }
  }

  const quiz = row.quizJson as GeneratedScenarioQuiz
  return {
    ...base,
    procedureName: quiz.procedureName,
    scenario: quiz.scenario,
    question: quiz.question,
    options: quiz.options,
  }
}
