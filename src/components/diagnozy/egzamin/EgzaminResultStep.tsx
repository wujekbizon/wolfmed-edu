import { Check, Minus, X } from 'lucide-react'
import type { DiagnozyExamStepResult } from '@/types/diagnozyTypes'

const GROUPS = [
  {
    key: 'hits',
    label: 'Poprawnie zaznaczone',
    icon: Check,
    chip: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    key: 'missed',
    label: 'Pominięte',
    icon: Minus,
    chip: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  {
    key: 'extra',
    label: 'Zaznaczone błędnie',
    icon: X,
    chip: 'text-rose-700 bg-rose-50 border-rose-200',
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
    <div className="border border-zinc-200 rounded-xl bg-white p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
          {step.label}
        </h3>
        <span className="text-sm font-semibold text-zinc-600 tabular-nums">
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
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <li
                    key={item}
                    className={`flex items-start gap-2 text-sm border rounded-lg p-2.5 ${group.chip}`}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      {item}
                      {step.field === 'interwencje' && uzasadnienia[item] && (
                        <span className="block mt-1 text-xs text-zinc-500">
                          <span className="font-semibold uppercase tracking-wide">
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
    </div>
  )
}
