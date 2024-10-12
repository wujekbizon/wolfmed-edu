import CircularProgressBar from './CircularProgressBar'

export default function UserProgress({
  completedTestsCount,
  averageScore,
  totalTests,
}: {
  completedTestsCount: number
  averageScore: number
  totalTests: number
}) {
  return (
    <div className="bg-zinc-50 p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
      <h3 className="text-xl font-semibold text-zinc-800 mb-6">Przegląd postępów</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <CircularProgressBar
            percentage={(completedTestsCount / totalTests) * 100}
            color="#f58a8a"
            size={160}
            strokeWidth={12}
          />
          <p className="mt-4 text-lg font-semibold text-zinc-700">Ukończone testy</p>
          <p className="text-3xl font-bold text-[#f58a8a]">
            {completedTestsCount} / {totalTests}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <CircularProgressBar percentage={averageScore} color="#4CAF50" size={160} strokeWidth={12} />
          <p className="mt-4 text-lg font-semibold text-zinc-700">Średni wynik</p>
          <p className="text-3xl font-bold text-[#4CAF50]">{averageScore.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  )
}
