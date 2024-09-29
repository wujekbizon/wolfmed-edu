import { Test } from '@/types/dataTypes'
import { shuffleArray } from './shuffleArray'

export function generateRandomTests(testArray: Test[], numOfQuestions: number) {
  if (!testArray.length) {
    return []
  }

  numOfQuestions = Math.min(numOfQuestions, testArray.length)

  const selectedTests = new Set<Test>()

  while (selectedTests.size < numOfQuestions) {
    const randomIndex = Math.floor(Math.random() * testArray.length)
    const randomQuestion = testArray[randomIndex]

    if (randomQuestion) {
      const shuffleAnswers = shuffleArray(randomQuestion.data.answers)
      selectedTests.add({
        ...randomQuestion,
        data: {
          ...randomQuestion.data,
          answers: shuffleAnswers,
        },
      })
    }
  }

  return Array.from(selectedTests)
}
