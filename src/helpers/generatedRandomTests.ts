import { Test } from '@/types/dataTypes'
import { shuffleArray } from './shuffleArray'

export function generateRandomTests(testArray: Test[], numOfQuestions: number) {
  if (!testArray.length) {
    return []
  }

  // Ensure we don't try to select more questions than available
  numOfQuestions = Math.min(numOfQuestions, testArray.length)

  // Create a copy of the testArray and shuffle it
  const shuffledTests = shuffleArray([...testArray])

  // Select the first numOfQuestions tests from the shuffled array
  const selectedTests = shuffledTests.slice(0, numOfQuestions)

  // Shuffle the answers for each selected test
  return selectedTests.map((test) => ({
    ...test,
    data: {
      ...test.data,
      answers: shuffleArray(test.data.answers),
    },
  }))
}
