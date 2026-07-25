'use client'

import { BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type { BodyZoneAssignments } from '@/types/diagnozyTypes'

export default function WykonanieInterwencjeList({
  interwencje,
  zones,
  active,
  onSelect,
}: {
  interwencje: string[]
  zones: BodyZoneAssignments
  active: string | null
  onSelect: (interwencja: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 min-w-0 order-2 lg:order-1">
      {interwencje.map((item, index) => {
        const isActive = active === item
        return (
          <button
            key={item}
            id={`interwencja-${index}`}
            type="button"
            onClick={() => onSelect(item)}
            aria-pressed={isActive}
            aria-expanded={isActive}
            className={`flex items-start gap-2.5 text-left p-3 rounded-xl border text-sm transition-all cursor-pointer
              ${
                isActive
                  ? 'border-rose-300 bg-rose-50/70 shadow-sm text-zinc-800'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
              }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border text-xs font-semibold tabular-nums flex items-center justify-center
                ${
                  isActive
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : zones[item]
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-zinc-300 text-zinc-500'
                }`}
            >
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className={`block min-w-0 ${isActive ? '' : 'line-clamp-2'}`}>{item}</span>
              {zones[item] && (
                <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                  {BODY_ZONE_LABELS[zones[item]]}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
