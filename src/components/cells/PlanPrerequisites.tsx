import { CheckCircle2 } from 'lucide-react'

interface PlanPrerequisitesProps {
  prerequisites: string[]
}

export default function PlanPrerequisites({ prerequisites }: PlanPrerequisitesProps) {
  if (prerequisites.length === 0) return null

  return (
    <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-2">Wymagania wstępne</p>
      <div className="flex flex-wrap gap-2">
        {prerequisites.map((prereq, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-white border border-zinc-200 text-zinc-600 text-xs px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-zinc-400" />
            {prereq}
          </span>
        ))}
      </div>
    </div>
  )
}
