'use client'

import { Check, MousePointerClick } from 'lucide-react'
import Card from '@/components/ui/Card'
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
      <Card tone="muted" className="p-4">
        <p className="text-sm text-zinc-500">
          Wybierz interwencję z listy, aby wskazać miejsce na ciele pacjenta.
        </p>
      </Card>
    )
  }

  return (
    <Card tone="active" className="p-4" aria-live="polite">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-exam-primary">
          Interwencja {index + 1}
        </span>
        {assignedZone ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-exam-success">
            <Check className="w-3.5 h-3.5" />
            {BODY_ZONE_LABELS[assignedZone]}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-exam-secondary">
            <MousePointerClick className="w-3.5 h-3.5" />
            Wskaż miejsce
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-zinc-700">{interwencja}</p>
    </Card>
  )
}
