'use client'

export default function WykonanieProgress({
  assigned,
  total,
}: {
  assigned: number
  total: number
}) {
  const percent = total === 0 ? 0 : Math.round((assigned / total) * 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Przypisano</span>
        <span className="text-xs font-semibold tabular-nums text-zinc-700">
          {assigned} / {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={assigned}
        aria-valuemin={0}
        aria-valuemax={total}
        className="h-1 rounded-full bg-zinc-100 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
