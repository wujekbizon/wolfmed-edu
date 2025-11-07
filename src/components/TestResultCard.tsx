import { fetchQuestionDetails } from '@/actions/fetchQuestionDetails'
import { CompletedTest } from '@/types/dataTypes'
import Link from 'next/link'

export default async function TestResultCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, testResult } = completedTest as CompletedTest

  const testsDataResponse = await fetchQuestionDetails(testResult)
  // Filter out undefined values and type assert the result
  const testsData = testsDataResponse.filter((item): item is NonNullable<typeof item> => item !== undefined)

  const questionDetails = testsData.map(({ testData, userCorrectAnswer }) => {
    const {
      id,
      data: { question, answers },
    } = testData
    const correctAnswer = answers?.find((answer) => !!answer.isCorrect)

    return (
      <div
        key={id}
        className={`${
          correctAnswer?.option === userCorrectAnswer?.option ? 'bg-green-400/20' : 'bg-red-400/20'
        } flex w-full flex-col md:flex-row items-center justify-between rounded-lg border border-zinc-200/40 p-3 shadow shadow-zinc-500`}
      >
        <div className="w-full md:w-2/3 border-b border-r-0 md:border-b-0 md:border-r border-zinc-400/20 p-3">
          {userCorrectAnswer.isCorrect ? (
            <p className="text-xs text-zinc-400">
              Super, na to pytanie udzielłeś prawidłowej odpowiedzi<i></i>
            </p>
          ) : (
            <p className="text-xs text-red-400">Niestety, na to pytanie udzielłeś nieprawidłowej odpowiedzi </p>
          )}
          <p className="text-base text-muted-foreground">{question}</p>
        </div>
        {correctAnswer ? (
          <div className="w-full md:w-1/3 p-3">
            <p className="text-xs text-zinc-400">Poprawna odpowiedż to: </p>
            <p className="text-base text-muted-foreground">{correctAnswer.option}</p>
          </div>
        ) : (
          <div className="w-full md:w-1/3 p-3">
            <p className="text-xs text-red-400">Nie znaleziono poprawnej odpowiedzi</p>
          </div>
        )}
      </div>
    )
  })

  return (
    <div className="flex w-full flex-col gap-4 overflow-y-auto items-center rounded-lg border border-red-200/60 bg-white shadow-md shadow-zinc-500 p-2 scrollbar-webkit md:p-8 lg:w-3/4 xl:w-2/3">
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-lg text-zinc-900">Twój wynik to: </h2>
        <p className="text-base text-zinc-800">
          <span className="text-xl text-[#ff5b5b] font-bold">{score}</span> / {testResult.length}
        </p>
      </div>
      {questionDetails}

      <Link
        className="bg-zinc-300 py-2 px-4 w-full sm:w-52 text-center rounded-md mt-4 hover:bg-zinc-300/70 "
        href="/panel/wyniki"
      >
        Powrót
      </Link>
    </div>
  )
}
