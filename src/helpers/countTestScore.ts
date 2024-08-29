import { QuestionAnswer } from '@/types/dataTypes'

/**
 * Counts the number of correct and incorrect answers from an array of question-answer records.
 *
 * @param results - An array of question-answer records where each record has a single key-value pair.
 * @returns An object containing the counts of correct and incorrect answers.
 * @throws Will throw an error if a record is malformed or if the answer key is not present.
 */

export function countTestScore(results: QuestionAnswer[]): {
  correct: number
  incorrect: number
} {
  // Initialize counters for correct and incorrect answers , and the total score
  let correct: number = 0
  let incorrect: number = 0

  // Iterate over each record in the results array
  results.forEach((item) => {
    // Extract the key from the record. Expecting a single key-value pair.
    const answerKey = Object.keys(item)[0]

    // Ensure the key is defined. If not, throw an error.
    if (!answerKey) {
      throw new Error('Something went wrong while processing your test score!')
    }
    // Get the value associated with the key.
    const answerValue = item[answerKey]

    // Determine if the answer is correct or incorrect and update counters
    switch (answerValue) {
      case 'true':
        // Increment the correct counter for a correct answer and update totalScore
        correct++
        break
      case 'false':
        // Increment the incorrect counter for an incorrect answer and update totalScore
        incorrect++
        break
      default:
        // Handle unexpected answer values
        throw new Error('Something went wrong while processing your test score!')
    }
  })

  // Return the counts of correct and incorrect answers
  return { correct, incorrect }
}
