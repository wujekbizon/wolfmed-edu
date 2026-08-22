import { formatMinutes } from '@/helpers/formatMinutes'

export default function PlanProgressBar({
  completionPercent,
  completedConcepts,
  totalConcepts,
  unattributedMinutes = 0,
}: {
  completionPercent: number
  completedConcepts: number
  totalConcepts: number
  unattributedMinutes?: number
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
      {unattributedMinutes > 0 && (
        <p className="mt-1.5 text-[11px] text-zinc-400">
          + {formatMinutes(unattributedMinutes)} nauki poza zagadnieniami planu
          (liczy się do serii i dziennego celu)
        </p>
      )}
    </div>
  )
}
