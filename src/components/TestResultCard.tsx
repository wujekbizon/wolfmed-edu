import { fetchQuestionDetails } from '@/actions/fetchQuestionDetails'
import { CompletedTest, Test } from '@/types/dataTypes'

export default async function TestResultCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, testResult, id } = completedTest as CompletedTest

  const testsData = (await fetchQuestionDetails(testResult)) as {
    testData: Test
    userCorrectAnswer: {
      option: string
      isCorrect: boolean
    }
  }[]

  const questionDetails = testsData?.map(({ testData, userCorrectAnswer }) => {
    const {
      id,
      data: { question, answers },
    } = testData
    const correctAnswer = answers?.find((answer) => !!answer.isCorrect)

    return (
      <div
        key={id}
        className={`${
          correctAnswer?.option === userCorrectAnswer?.option ? 'border-green-400' : 'border-red-400'
        } flex w-full items-center justify-between rounded border p-2`}
      >
        <div className="w-2/3">
          <p className="text-base text-muted-foreground">{question}</p>
        </div>
        {correctAnswer && (
          <div className="w-1/3">
            <p className="text-base text-muted-foreground">{correctAnswer.option}</p>
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-y-auto rounded-xl border border-border/40  p-2 scrollbar-webkit md:p-8 lg:h-3/4 lg:w-3/4">
      <div>
        <h2>Your Total Score: </h2>
        <p>{score}</p>
      </div>

      {questionDetails}
    </div>
  )
}
