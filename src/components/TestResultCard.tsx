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
          correctAnswer?.option === userCorrectAnswer?.option ? 'bg-green-400/30' : 'bg-red-400/30'
        } flex w-full flex-col md:flex-row items-center justify-between rounded-lg border border-zinc-200/40 p-3 shadow shadow-zinc-500`}
      >
        <div className="w-full md:w-2/3 border-b border-r-0 md:border-b-0 md:border-r border-zinc-800/10 p-2">
          <p className="text-base text-muted-foreground">{question}</p>
        </div>
        {correctAnswer && (
          <div className="w-full md:w-1/3 p-2">
            <p className="text-base text-muted-foreground">{correctAnswer.option}</p>
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto rounded-lg border border-red-200/60 bg-white shadow-md shadow-zinc-500 p-2 scrollbar-webkit md:p-8 lg:w-3/4 xl:w-2/3">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-lg text-zinc-900">Twój wynik to: </h2>

        <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
          <p className="text-xl text-[#ff5b5b] font-bold">{score}</p>
        </div>
      </div>

      {questionDetails}
    </div>
  )
}
