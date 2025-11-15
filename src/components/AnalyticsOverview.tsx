'use client'

import UserProgress from './UserProgress'

interface AnalyticsOverviewProps {
  stats: {
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }
}

export default function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
  const { totalScore, totalQuestions, testsAttempted } = stats
  const correctAnswers = totalScore
  const incorrectAnswers = totalQuestions - totalScore
  const accuracyPercentage = totalQuestions > 0 ? ((totalScore / totalQuestions) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
          <p className="text-sm font-medium text-zinc-600 mb-1">Pytania ogółem</p>
          <p className="text-3xl font-bold text-slate-900">{totalQuestions}</p>
          <p className="text-xs text-zinc-500 mt-2">Z {testsAttempted} testów</p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
          <p className="text-sm font-medium text-zinc-600 mb-1">Poprawne odpowiedzi</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
            <span className="text-sm font-semibold text-green-600">({accuracyPercentage}%)</span>
          </div>
          <div className="mt-3 relative w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${accuracyPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300">
          <p className="text-sm font-medium text-zinc-600 mb-1">Błędne odpowiedzi</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-red-600">{incorrectAnswers}</p>
            <span className="text-sm font-semibold text-red-600">({(100 - parseFloat(accuracyPercentage)).toFixed(1)}%)</span>
          </div>
          <div className="mt-3 relative w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-[#ff9898] rounded-full transition-all duration-500"
              style={{ width: `${100 - parseFloat(accuracyPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      <UserProgress
        totalScore={totalScore}
        totalQuestions={totalQuestions}
        testsAttempted={testsAttempted}
      />
    </div>
  )
}
