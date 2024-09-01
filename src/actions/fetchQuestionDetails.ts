import { getQuestionById } from '@/server/queries'
import { FormattedAnswer, Test } from '@/types/dataTypes'

export async function fetchQuestionDetails(results: FormattedAnswer[]) {
  // Fetch question details in parallel for each formatted answer
  const questionDetailsPromises = results.map(async (result) => {
    const testData = (await getQuestionById(result.questionId)) as Test
    const userCorrectAnswer = testData?.data.answers.find((answer) => answer.isCorrect === result.answer)

    if (!userCorrectAnswer) {
      return
    }

    return { testData, userCorrectAnswer }
  })

  // Wait for all promises to resolve and return the details
  const resolvedDetails = await Promise.all(questionDetailsPromises)

  return resolvedDetails
}
