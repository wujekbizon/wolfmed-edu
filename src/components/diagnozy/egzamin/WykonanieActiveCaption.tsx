'use client'

import { Check, MousePointerClick } from 'lucide-react'
import { BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
import type { BodyZone } from '@/types/diagnozyTypes'

// The number alone never says what is being placed, and the two-step nature of
// the task (pick, then place) is otherwise invisible — so both are stated here.
export default function WykonanieActiveCaption({
  index,
  interwencja,
  assignedZone,
}: {
  index: number
  interwencja: string | null
  assignedZone: BodyZone | null
}) {
  if (!interwencja) {
    return (
      <p className="text-sm text-zinc-400">
        Wybierz interwencję, aby wskazać miejsce na ciele pacjenta.
      </p>
    )
  }

  return (
    <div aria-live="polite">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Interwencja {index + 1}
        </span>
        {assignedZone ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
            <Check className="w-3.5 h-3.5" />
            {BODY_ZONE_LABELS[assignedZone]}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
            <MousePointerClick className="w-3.5 h-3.5" />
            Wskaż miejsce
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-zinc-700">{interwencja}</p>
    </div>
  )
}
