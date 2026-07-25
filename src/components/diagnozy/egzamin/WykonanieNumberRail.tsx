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
            className={`w-8 h-8 shrink-0 rounded-full text-xs font-semibold tabular-nums border transition-colors cursor-pointer
              ${
                isActive
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : assignedZone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:border-emerald-400'
                    : 'bg-white border-zinc-300 text-zinc-500 hover:border-zinc-400'
              }`}
          >
            {index + 1}
          </button>
        )
      })}
    </div>
  )
}
