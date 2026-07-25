'use client'

import { BODY_ZONES, BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type { BodyZone } from '@/types/diagnozyTypes'

export default function BodyZonePicker({
  assignedZone,
  onAssign,
}: {
  assignedZone: BodyZone | null
  onAssign: (zone: BodyZone) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {BODY_ZONES.map((zone) => (
        <button
          key={zone}
          type="button"
          onClick={() => onAssign(zone)}
          aria-pressed={assignedZone === zone}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer
            ${
              assignedZone === zone
                ? 'bg-rose-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-rose-100 hover:text-rose-700'
            }`}
        >
          {BODY_ZONE_LABELS[zone]}
        </button>
      ))}
    </div>
  )
}
