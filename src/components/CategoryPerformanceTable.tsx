'use client'

interface CategoryPerformanceTableProps {
  categories: Array<{
    category: string
    totalTests: number
    avgScore: string
    totalQuestions: number
    correctAnswers: number
  }>
}

export default function CategoryPerformanceTable({ categories }: CategoryPerformanceTableProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Wyniki według kategorii</h3>
        <div className="flex items-center justify-center h-32 text-zinc-500">
          Brak danych do wyświetlenia
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Wyniki według kategorii</h3>
        <p className="text-sm text-zinc-600">Twoje wyniki podzielone według kategorii testów</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-900">Kategoria</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900">Testy</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900">Pytania</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-900">Poprawne</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-slate-900">Średnia</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const avgScore = parseFloat(category.avgScore)
              const scoreColor = avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-[#ff9898]' : 'text-red-600'

              return (
                <tr
                  key={index}
                  className="border-b border-zinc-100 hover:bg-white/60 transition-colors"
                >
                  <td className="py-4 px-4">
                    <span className="text-sm font-medium text-slate-900">{category.category}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center justify-center min-w-[32px] h-7 px-2 rounded-full bg-zinc-100 text-xs font-semibold text-zinc-700">
                      {category.totalTests}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm text-zinc-600">{category.totalQuestions}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-sm font-medium text-zinc-800">{category.correctAnswers}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="relative w-20 h-2 bg-zinc-200 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#ff9898] to-[#ffc5c5] rounded-full transition-all duration-300"
                          style={{ width: `${avgScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${scoreColor} min-w-[60px]`}>
                        {avgScore.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
