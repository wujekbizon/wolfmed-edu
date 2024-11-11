import { calculateAverageScore } from '@/helpers/calculateAverageScore'
import CircularProgressBar from './CircularProgressBar'
import LinearProgressBar from './LinearProgressBar'
import { getUserStats } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

export default async function UserProgress() {
  const user = await currentUser()
  if (!user) notFound()
  const { totalScore, totalQuestions, testsAttempted } = await getUserStats(user.id)
  const overallProgressPercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0
  const averageScore = calculateAverageScore(totalScore, totalQuestions)

  return (
    <div
      className="bg-zinc-900 backdrop-blur p-4 sm:p-6 rounded-xl border border-zinc-800 
      shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-6 sm:mb-8 text-center sm:text-left">
        Przegląd postępów
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
        <div className="flex flex-col items-center">
          <CircularProgressBar
            percentage={Math.min((testsAttempted / 150) * 100, 100)}
            color="#ff9898"
            size={120}
            strokeWidth={12}
            bgColor="rgba(255, 255, 255, 0.1)"
          />
          <p className="mt-4 sm:mt-5 text-base sm:text-lg font-medium text-zinc-400">Ukończone testy</p>
          <p className="text-xl sm:text-3xl font-bold text-white mt-2">{testsAttempted}</p>
        </div>

        <div className="flex flex-col items-center">
          <CircularProgressBar
            percentage={averageScore}
            color="#ff9898"
            size={120}
            strokeWidth={12}
            bgColor="rgba(255, 255, 255, 0.1)"
          />
          <p className="mt-4 sm:mt-5 text-base sm:text-lg font-medium text-zinc-400">Średni wynik</p>
          <p className="text-xl sm:text-3xl font-bold text-white mt-2">{averageScore.toFixed(2)}%</p>
        </div>
      </div>

      <div className="mt-8 sm:mt-10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-base sm:text-lg font-medium text-zinc-300">Całkowity wynik</p>
          <p className="text-sm text-zinc-400">
            {totalScore} / {totalQuestions}
          </p>
        </div>
        <LinearProgressBar
          percentage={overallProgressPercentage}
          totalScore={totalScore}
          totalQuestions={totalQuestions}
          color="#ff9898"
          bgColor="rgba(255, 255, 255, 0.1)"
        />
      </div>
    </div>
  )
}
