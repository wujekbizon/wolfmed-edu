'use client'

import WykonanieActiveCaption from '@/components/diagnozy/egzamin/WykonanieActiveCaption'
import WykonanieProgress from '@/components/diagnozy/egzamin/WykonanieProgress'
import WykonanieNumberRail from '@/components/diagnozy/egzamin/WykonanieNumberRail'
import BodyZonePicker from '@/components/diagnozy/egzamin/BodyZonePicker'
import Card from '@/components/ui/Card'
import type { BodyZone, BodyZoneAssignments } from '@/types/diagnozyTypes'

// One card divided by hairlines, not four stacked cards — the rail is a single
// panel of related controls, and boxing each group made it read as clutter.
export default function WykonanieSidePanel({
  interwencje,
  zones,
  active,
  activeIndex,
  assignedCount,
  onSelect,
  onAssign,
}: {
  interwencje: string[]
  zones: BodyZoneAssignments
  active: string | null
  activeIndex: number
  assignedCount: number
  onSelect: (interwencja: string) => void
  onAssign: (zone: BodyZone) => void
}) {
  const assignedZone = active ? (zones[active] ?? null) : null

  return (
    <Card tone="plain" className="divide-y divide-zinc-900/[0.06]">
      <div className="p-4">
        <WykonanieProgress assigned={assignedCount} total={interwencje.length} />
      </div>

      <div className="p-4">
        <WykonanieActiveCaption
          index={activeIndex}
          interwencja={active}
          assignedZone={assignedZone}
        />
      </div>

      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2.5">
          Interwencje
        </p>
        <WykonanieNumberRail
          interwencje={interwencje}
          zones={zones}
          active={active}
          onSelect={onSelect}
        />
      </div>

      <div className="p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2.5">
          Obszar ciała
        </p>
        <BodyZonePicker assignedZone={assignedZone} onAssign={onAssign} />
      </div>
    </Card>
  )
}
