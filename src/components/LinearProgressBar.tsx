type LinearProgressBarProps = {
  percentage: number
  totalScore: number
  totalQuestions: number
}

export default function LinearProgressBar({ percentage, totalScore, totalQuestions }: LinearProgressBarProps) {
  return (
    <div className="w-full">
      <div className="w-full bg-zinc-300 rounded-full h-2 sm:h-4 mb-2">
        <div
          className="bg-[#4CAF50] h-2 sm:h-4 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs sm:text-sm">
        <p className="text-zinc-600">{totalScore || 0}</p>
        <p className="font-semibold text-zinc-700">
          {totalScore} / {totalQuestions} ({percentage.toFixed(2)}%)
        </p>
        <p className="text-zinc-600">{totalQuestions}</p>
      </div>
    </div>
  )
}
