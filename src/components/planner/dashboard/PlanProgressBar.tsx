export default function PlanProgressBar({
  completionPercent,
  completedConcepts,
  totalConcepts,
}: {
  completionPercent: number
  completedConcepts: number
  totalConcepts: number
}) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
        <span>Postęp planu</span>
        <span>
          {completedConcepts}/{totalConcepts} zagadnień ukończonych
        </span>
      </div>
      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff9898] to-red-500 rounded-full transition-all"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </div>
  )
}
