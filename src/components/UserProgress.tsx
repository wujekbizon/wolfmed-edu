import CircularProgressBar from './CircularProgressBar'
import LinearProgressBar from './LinearProgressBar'

export default function UserProgress({
  testsAttempted,
  averageScore,
  totalScore,
  totalQuestions,
}: {
  testsAttempted: number
  averageScore: number
  totalScore: number
  totalQuestions: number
}) {
  const overallProgressPercentage = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0

  return (
    <div className="bg-zinc-50 p-4 sm:p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
      <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 mb-4 sm:mb-6 text-center sm:text-left">
        Przegląd postępów
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        <div className="flex flex-col items-center">
          <CircularProgressBar
            percentage={Math.min((testsAttempted / 100) * 100, 100)}
            color="#f58a8a"
            size={120}
            strokeWidth={12}
          />
          <p className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-zinc-700">Ukończone testy</p>
          <p className="text-xl sm:text-3xl font-bold text-[#f58a8a]">{testsAttempted}</p>
        </div>
        <div className="flex flex-col items-center">
          <CircularProgressBar percentage={averageScore} color="#4CAF50" size={120} strokeWidth={12} />
          <p className="mt-2 sm:mt-4 text-base sm:text-lg font-semibold text-zinc-700">Średni wynik</p>
          <p className="text-xl sm:text-3xl font-bold text-[#4CAF50]">{averageScore.toFixed(2)}%</p>
        </div>
      </div>
      <div className="mt-6 sm:mt-8">
        <p className="text-base sm:text-lg font-semibold text-zinc-700 mb-2">Całkowity wynik</p>
        <LinearProgressBar
          percentage={overallProgressPercentage}
          totalScore={totalScore}
          totalQuestions={totalQuestions}
        />
        <p className="text-xs sm:text-sm text-zinc-600 mt-2 text-center">Poprawne odpowiedzi / Wszystkie pytania</p>
      </div>
    </div>
  )
}
