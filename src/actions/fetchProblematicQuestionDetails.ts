import { getQuestionById } from '@/server/queries'
import { Test } from '@/types/dataTypes'

interface ProblematicQuestion {
  questionId: string
  timesAnswered: number
  timesCorrect: number
  accuracy: number
}

export async function fetchProblematicQuestionDetails(questions: ProblematicQuestion[]) {
  const questionDetailsPromises = questions.map(async (question) => {
    const testData = (await getQuestionById(question.questionId)) as Test

    if (!testData) {
      return null
    }

    const correctAnswer = testData.data.answers.find((answer) => answer.isCorrect)

    return {
      questionId: question.questionId,
      questionText: testData.data.question,
      category: testData.category,
      correctAnswer: correctAnswer?.option || 'N/A',
      timesAnswered: question.timesAnswered,
      timesCorrect: question.timesCorrect,
      accuracy: question.accuracy,
      errorRate: 100 - question.accuracy,
    }
  })

  const resolvedDetails = await Promise.all(questionDetailsPromises)

  return resolvedDetails.filter((detail) => detail !== null)
}
