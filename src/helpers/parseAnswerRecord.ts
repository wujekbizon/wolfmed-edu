import { FormattedAnswer, QuestionAnswer } from '@/types/dataTypes'

/**
 * Parses an array of question-answer records and transforms it into an array of formatted answers.
 *
 * @param results - An array of question-answer records where each record has a single key-value pair.
 * @returns An array of formatted answers with questionId as a string and answer as a boolean.
 * @throws Will throw an error if a record is malformed or if the answer key is not present.
 */

export function parseAnswerRecord(results: QuestionAnswer[]): FormattedAnswer[] {
  return results.map((item) => {
    // Extract the key from the record. Expecting a single key-value pair.
    const answerKey = Object.keys(item)[0]

    // Ensure the key is defined. If not, throw an error.
    if (!answerKey) {
      throw new Error('Something went wrong while processing your test score!')
    }

    // Get the value associated with the key.
    const answerValue = item[answerKey]
    // Extract the numeric part of the key by removing the 'answer-' prefix and parsing it to an integer.
    const questionId = answerKey.replace('answer-', '')
    // Convert the string value 'true'/'false' to a boolean.
    const answer = answerValue === 'true'

    // Return the formatted answer object.
    return { questionId, answer }
  })
}
