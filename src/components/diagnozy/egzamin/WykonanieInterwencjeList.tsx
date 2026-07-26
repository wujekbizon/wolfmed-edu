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
            className={`flex items-start gap-2.5 text-left p-3 rounded-card border shadow-card
              transition-all cursor-pointer hover:shadow-card-raised
              ${
                isActive
                  ? 'bg-rose-50/60 border-rose-300'
                  : 'bg-white border-surface-border hover:border-zinc-300'
              }`}
          >
            <span
              aria-hidden
              className={`mt-0.5 w-6 h-6 shrink-0 rounded-full border text-xs font-semibold
                tabular-nums flex items-center justify-center
                ${
                  isActive
                    ? 'bg-exam-primary border-exam-primary text-white'
                    : assignedZone
                      ? 'bg-emerald-50 border-emerald-300 text-exam-success'
                      : 'bg-white border-zinc-300 text-zinc-400'
                }`}
            >
              {assignedZone && !isActive ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </span>

            <span className="min-w-0">
              <span className="block text-sm text-zinc-700 line-clamp-2">{item}</span>
              <span
                className={`mt-1.5 inline-block text-xs font-medium ${
                  assignedZone ? 'text-exam-success' : 'text-zinc-400'
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
