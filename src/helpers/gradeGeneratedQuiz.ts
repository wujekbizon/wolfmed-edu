import type {
  GeneratedKnowledgeQuiz,
  GeneratedScenarioQuiz,
  GeneratedSpotErrorQuiz,
} from '@/types/generatedQuizTypes'

/**
 * Grades a submitted answer set against the server-stored quiz. The client
 * never sees or sends correct answers — `answersJson` shape depends on type:
 * - knowledge-quiz: Record<questionId, selectedOptionIndex>
 * - spot-error: string[] of step ids marked as errors
 * - scenario-based: number (selected option index)
 */
export function gradeGeneratedQuiz(
  challengeType: string,
  quizData: unknown,
  answersJson: string
): { score: number } {
  const answers = JSON.parse(answersJson)

  if (challengeType === 'knowledge-quiz') {
    const quiz = quizData as GeneratedKnowledgeQuiz
    if (typeof answers !== 'object' || answers === null || Array.isArray(answers)) {
      throw new Error('Nieprawidłowy format odpowiedzi')
    }
    const correct = quiz.questions.filter(
      (question) => answers[question.id] === question.correctAnswer
    ).length
    return { score: Math.round((correct / quiz.questions.length) * 100) }
  }

  if (challengeType === 'spot-error') {
    const quiz = quizData as GeneratedSpotErrorQuiz
    if (!Array.isArray(answers)) {
      throw new Error('Nieprawidłowy format odpowiedzi')
    }
    const selected = answers as string[]
    const actualErrors = quiz.steps
      .filter((step) => !step.isCorrect)
      .map((step) => step.id)
    const hits = selected.filter((id) => actualErrors.includes(id)).length
    const misses = selected.filter((id) => !actualErrors.includes(id)).length
    return {
      score: Math.max(
        0,
        Math.round(((hits - misses) / actualErrors.length) * 100)
      ),
    }
  }

  if (challengeType === 'scenario-based') {
    const quiz = quizData as GeneratedScenarioQuiz
    if (typeof answers !== 'number') {
      throw new Error('Nieprawidłowy format odpowiedzi')
    }
    return { score: answers === quiz.correctAnswer ? 100 : 0 }
  }

  throw new Error(`Nieznany typ wyzwania: ${challengeType}`)
}
