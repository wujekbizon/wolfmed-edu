import { FormattedAnswer, Test } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { tests } from '@/server/db/schema'
import { inArray } from 'drizzle-orm'

export async function fetchQuestionDetails(results: FormattedAnswer[]) {
  // Extract unique question IDs
  const questionIds = [...new Set(results.map((r) => r.questionId))]

  // Batch fetch all tests in ONE query (instead of 12,984 individual queries!)
  const testsData = await db.query.tests.findMany({
    where: inArray(tests.id, questionIds),
  })

  // Create a Map for O(1) lookups
  const testsMap = new Map<string, Test>(
    testsData.map((test) => [test.id, test as Test])
  )

  // Map results to details
  const details = results
    .map((result) => {
      const testData = testsMap.get(result.questionId)
      if (!testData) return undefined

      const userCorrectAnswer = testData.data.answers.find(
        (answer) => answer.isCorrect === result.answer
      )

      if (!userCorrectAnswer) return undefined

      return { testData, userCorrectAnswer }
    })
    .filter((detail) => detail !== undefined)

  return details
}
