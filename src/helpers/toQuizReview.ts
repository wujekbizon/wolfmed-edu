import type {
  GeneratedKnowledgeQuiz,
  GeneratedScenarioQuiz,
  GeneratedSpotErrorQuiz,
} from '@/types/generatedQuizTypes'
import type { QuizReviewItem } from '@/types/quizUiTypes'

/**
 * Builds the post-grading review revealed to the client only AFTER
 * submission: correct answers, the user's picks and explanations.
 * For spot-error only the interesting rows are returned (real errors and
 * false positives), not every correct untouched step.
 */
export function toQuizReview(
  challengeType: string,
  quizData: unknown,
  answersJson: string
): QuizReviewItem[] {
  const answers = JSON.parse(answersJson)

  if (challengeType === 'knowledge-quiz') {
    const quiz = quizData as GeneratedKnowledgeQuiz
    return quiz.questions.map((question) => {
      const selected = answers[question.id] as number | undefined
      return {
        id: question.id,
        prompt: question.question,
        correctLabel: question.options[question.correctAnswer] ?? '',
        selectedLabel:
          selected !== undefined ? question.options[selected] ?? null : null,
        isCorrect: selected === question.correctAnswer,
        explanation: question.explanation ?? null,
      }
    })
  }

  if (challengeType === 'spot-error') {
    const quiz = quizData as GeneratedSpotErrorQuiz
    const marked = new Set(answers as string[])
    return quiz.steps
      .filter((step) => !step.isCorrect || marked.has(step.id))
      .map((step) => ({
        id: step.id,
        prompt: step.step,
        correctLabel: step.isCorrect ? 'Krok prawidłowy' : 'Krok zawiera błąd',
        selectedLabel: marked.has(step.id)
          ? 'Oznaczono jako błąd'
          : 'Nie oznaczono',
        isCorrect: marked.has(step.id) === !step.isCorrect,
        explanation: step.explanation ?? null,
        category: step.errorCategory ?? null,
      }))
  }

  const quiz = quizData as GeneratedScenarioQuiz
  const selected = answers as number
  return [
    {
      id: 'scenario',
      prompt: quiz.question,
      correctLabel: quiz.options[quiz.correctAnswer] ?? '',
      selectedLabel: quiz.options[selected] ?? null,
      isCorrect: selected === quiz.correctAnswer,
      explanation: quiz.explanation ?? null,
    },
  ]
}
