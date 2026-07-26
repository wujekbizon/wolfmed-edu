'use client'

import { Check } from 'lucide-react'
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {interwencje.map((item, index) => {
        const isActive = active === item
        const assignedZone = zones[item]

        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            aria-pressed={isActive}
            className={`flex items-start gap-3 text-left p-3.5 rounded-2xl cursor-pointer
              transition-all duration-200 ring-1
              ${
                isActive
                  ? 'bg-rose-50/40 ring-rose-400/40 shadow-[0_12px_28px_-16px_rgba(190,24,93,0.3)]'
                  : 'bg-white ring-zinc-900/[0.06] hover:ring-zinc-900/[0.12] hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgba(16,24,40,0.2)]'
              }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border text-xs font-semibold
                tabular-nums flex items-center justify-center
                ${
                  isActive
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : assignedZone
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                }`}
            >
              {assignedZone && !isActive ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>

            <span className="min-w-0">
              <span className="block text-sm text-zinc-700 line-clamp-2">{item}</span>
              <span
                className={`mt-1.5 inline-block text-xs font-medium ${
                  assignedZone ? 'text-emerald-600' : 'text-zinc-400'
                }`}
              >
                {assignedZone ? BODY_ZONE_LABELS[assignedZone] : 'Oczekuje na przypisanie'}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
