'use client'

import { BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type { BodyZone } from '@/types/diagnozyTypes'

export default function WykonanieActiveCaption({
  index,
  interwencja,
  assignedZone,
}: {
  index: number
  interwencja: string | null
  assignedZone: BodyZone | null
}) {
  if (!interwencja) return null

  return (
    <div
      aria-live="polite"
      className="mt-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2"
    >
      <p className="text-xs font-semibold text-rose-700 mb-0.5">
        Interwencja {index + 1}
        {assignedZone && (
          <span className="font-medium text-zinc-500">
            {' '}
            — przypisano: {BODY_ZONE_LABELS[assignedZone]}
          </span>
        )}
      </p>
      <p className="text-sm text-zinc-700 line-clamp-3">{interwencja}</p>
    </div>
  )
}
