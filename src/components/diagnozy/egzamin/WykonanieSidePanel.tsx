'use client'

import WykonanieActiveCaption from '@/components/diagnozy/egzamin/WykonanieActiveCaption'
import WykonanieProgress from '@/components/diagnozy/egzamin/WykonanieProgress'
import WykonanieNumberRail from '@/components/diagnozy/egzamin/WykonanieNumberRail'
import BodyZonePicker from '@/components/diagnozy/egzamin/BodyZonePicker'
import Card from '@/components/ui/Card'
import type { BodyZone, BodyZoneAssignments } from '@/types/diagnozyTypes'

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
    <div className="flex flex-col gap-4">
      <WykonanieProgress assigned={assignedCount} total={interwencje.length} />

      <WykonanieActiveCaption
        index={activeIndex}
        interwencja={active}
        assignedZone={assignedZone}
      />

      <Card tone="plain" className="p-4">
        <p className="text-xs font-medium text-zinc-500 mb-2">Przejdź do interwencji</p>
        <WykonanieNumberRail
          interwencje={interwencje}
          zones={zones}
          active={active}
          onSelect={onSelect}
        />
      </Card>

      <Card tone="plain" className="p-4">
        <p className="text-xs font-medium text-zinc-500 mb-2">
          Kliknij ciało pacjenta lub wybierz obszar
        </p>
        <BodyZonePicker assignedZone={assignedZone} onAssign={onAssign} />
      </Card>
    </div>
  )
}
