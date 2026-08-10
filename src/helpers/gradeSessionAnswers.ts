import type { FormattedAnswer, Test } from '@/types/dataTypes'

type GradeResult =
  | { success: false; message: string }
  | { success: true; correct: number; testResult: FormattedAnswer[] }

export function gradeSessionAnswers(
  tests: Test[],
  submittedAnswers: Record<string, string>
): GradeResult {
  const expectedKeys = new Set(tests.map((test) => `answer-${test.id}`))
  const submittedKeys = Object.keys(submittedAnswers)

  if (
    submittedKeys.length !== expectedKeys.size
    || submittedKeys.some((key) => !expectedKeys.has(key))
  ) {
    return { success: false, message: 'Odpowiedz na wszystkie pytania.' }
  }

  const testResult: FormattedAnswer[] = []
  let correct = 0

  for (const test of tests) {
    const rawIndex = submittedAnswers[`answer-${test.id}`]
    if (!rawIndex || !/^\d+$/.test(rawIndex)) {
      return {
        success: false,
        message: 'Wybierz jedną odpowiedź przy każdym pytaniu.',
      }
    }

    const selectedAnswer = test.data.answers[Number(rawIndex)]
    if (!selectedAnswer) {
      return { success: false, message: 'Wybrano nieprawidłową odpowiedź.' }
    }

    if (selectedAnswer.isCorrect) correct++
    testResult.push({ questionId: test.id, answer: selectedAnswer.isCorrect })
  }

  return { success: true, correct, testResult }
}
