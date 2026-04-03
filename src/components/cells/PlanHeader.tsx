import { Clock, BookOpen, Target } from 'lucide-react'

interface PlanHeaderProps {
  topic: string
  goal: string
  estimatedTotalMinutes: number
}

export default function PlanHeader({ topic, goal, estimatedTotalMinutes }: PlanHeaderProps) {
  const hours = Math.floor(estimatedTotalMinutes / 60)
  const minutes = estimatedTotalMinutes % 60
  const timeLabel = hours > 0
    ? `${hours}h ${minutes > 0 ? `${minutes}min` : ''}`
    : `${minutes}min`

  return (
    <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4 shrink-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Plan nauki</p>
            <h3 className="font-semibold text-zinc-900 text-base leading-snug">{topic}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/70 border border-zinc-200 rounded-full px-3 py-1 shrink-0">
          <Clock className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-600">{timeLabel}</span>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2">
        <Target className="w-4 h-4 text-[#ff9898] shrink-0 mt-0.5" />
        <p className="text-sm text-zinc-700">{goal}</p>
      </div>
    </div>
  )
}
