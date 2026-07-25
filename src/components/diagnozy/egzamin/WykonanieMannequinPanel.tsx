'use client'

import dynamic from 'next/dynamic'
import { LoaderCircle } from 'lucide-react'
import WykonanieNumberRail from '@/components/diagnozy/egzamin/WykonanieNumberRail'
import WykonanieActiveCaption from '@/components/diagnozy/egzamin/WykonanieActiveCaption'
import BodyZonePicker from '@/components/diagnozy/egzamin/BodyZonePicker'
import type { BodyZone, BodyZoneAssignments } from '@/types/diagnozyTypes'

const MannequinScene = dynamic(
  () => import('@/components/diagnozy/egzamin/mannequin/MannequinScene'),
  {
    ssr: false,
    loading: () => (
      <div className="h-105 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-center">
        <LoaderCircle className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    ),
  }
)

export default function WykonanieMannequinPanel({
  interwencje,
  zones,
  active,
  activeIndex,
  onSelect,
  onAssign,
}: {
  interwencje: string[]
  zones: BodyZoneAssignments
  active: string | null
  activeIndex: number
  onSelect: (interwencja: string) => void
  onAssign: (zone: BodyZone) => void
}) {
  const assignedZone = active ? (zones[active] ?? null) : null

  return (
    <div className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-4">
      <MannequinScene selectedZone={assignedZone} onZoneClick={onAssign} />

      <WykonanieActiveCaption
        index={activeIndex}
        interwencja={active}
        assignedZone={assignedZone}
      />

      <p className="text-xs text-zinc-400 mt-3 mb-1.5">Wybierz interwencję:</p>
      <WykonanieNumberRail
        interwencje={interwencje}
        zones={zones}
        active={active}
        onSelect={onSelect}
      />

      <p className="text-xs text-zinc-400 mt-3 mb-1.5">
        Kliknij część ciała lub wybierz z listy:
      </p>
      <BodyZonePicker assignedZone={assignedZone} onAssign={onAssign} />
    </div>
  )
}
