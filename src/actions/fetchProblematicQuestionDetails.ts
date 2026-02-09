import { Test } from '@/types/dataTypes'
import { db } from '@/server/db/index'
import { tests } from '@/server/db/schema'
import { inArray } from 'drizzle-orm'

interface ProblematicQuestion {
  questionId: string
  timesAnswered: number
  timesCorrect: number
  accuracy: number
}

export async function fetchProblematicQuestionDetails(questions: ProblematicQuestion[]) {
  // Extract unique question IDs
  const questionIds = [...new Set(questions.map((q) => q.questionId))]

  // Batch fetch all tests in ONE query
  const testsData = await db.query.tests.findMany({
    where: inArray(tests.id, questionIds),
  })

  // Create Map for O(1) lookups
  const testsMap = new Map<string, Test>(
    testsData.map((test) => [test.id, test as Test])
  )

  // Map questions to details
  const details = questions
    .map((question) => {
      const testData = testsMap.get(question.questionId)
      if (!testData) return null

      const correctAnswer = testData.data.answers.find((answer) => answer.isCorrect)

      return {
        questionId: question.questionId,
        questionText: testData.data.question,
        category: testData.meta.category,
        correctAnswer: correctAnswer?.option || 'N/A',
        timesAnswered: question.timesAnswered,
        timesCorrect: question.timesCorrect,
        accuracy: question.accuracy,
        errorRate: 100 - question.accuracy,
      }
    })
    .filter((detail) => detail !== null)

  return details
}
