'use client'

import { BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type { BodyZoneAssignments } from '@/types/diagnozyTypes'

export default function WykonanieNumberRail({
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
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Zaplanowane interwencje">
      {interwencje.map((item, index) => {
        const isActive = active === item
        const assignedZone = zones[item]
        const label = assignedZone
          ? `Interwencja ${index + 1} — ${BODY_ZONE_LABELS[assignedZone]}`
          : `Interwencja ${index + 1} — nie przypisano`

        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            aria-pressed={isActive}
            aria-label={label}
            title={item}
            className={`w-8 h-8 shrink-0 rounded-xl text-xs font-semibold tabular-nums
              transition-all cursor-pointer ring-1
              ${
                isActive
                  ? 'bg-rose-500 ring-rose-500 text-white shadow-[0_6px_14px_-6px_rgba(244,63,94,0.7)]'
                  : assignedZone
                    ? 'bg-emerald-50 ring-emerald-200 text-emerald-600 hover:ring-emerald-300'
                    : 'bg-zinc-50 ring-zinc-900/[0.06] text-zinc-400 hover:text-zinc-600 hover:ring-zinc-900/[0.12]'
              }`}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}
