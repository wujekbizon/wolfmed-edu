import { Check, Minus, X } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { DiagnozyExamStepResult } from '@/types/diagnozyTypes'

const GROUPS = [
  {
    key: 'hits',
    label: 'Poprawnie zaznaczone',
    icon: Check,
    row: 'bg-zinc-50/70 border-l-2 border-emerald-400',
    mark: 'text-emerald-500',
  },
  {
    key: 'missed',
    label: 'Pominięte',
    icon: Minus,
    row: 'bg-zinc-50/70 border-l-2 border-amber-400',
    mark: 'text-amber-500',
  },
  {
    key: 'extra',
    label: 'Zaznaczone błędnie',
    icon: X,
    row: 'bg-zinc-50/70 border-l-2 border-rose-400',
    mark: 'text-rose-400',
  },
] as const

export default function EgzaminResultStep({
  step,
  uzasadnienia,
}: {
  step: DiagnozyExamStepResult
  uzasadnienia: Record<string, string>
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          {step.label}
        </h3>
        <span className="text-sm font-semibold text-zinc-700 tabular-nums">
          {step.scorePercent}%
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {GROUPS.map((group) => {
          const items = step[group.key]
          if (items.length === 0) return null
          const Icon = group.icon

          return (
            <div key={group.key}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-1.5">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2.5 text-sm text-zinc-700 rounded-r-xl p-2.5 ${group.row}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${group.mark}`} aria-hidden />
                    <span className="min-w-0 leading-relaxed">
                      {item}
                      {step.field === 'interwencje' && uzasadnienia[item] && (
                        <span className="block mt-1.5 pt-1.5 border-t border-zinc-900/[0.06] text-xs text-zinc-500">
                          <span className="font-medium uppercase tracking-wider">
                            Uzasadnienie:{' '}
                          </span>
                          {uzasadnienia[item]}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
