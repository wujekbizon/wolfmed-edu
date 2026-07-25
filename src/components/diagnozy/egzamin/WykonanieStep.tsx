'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LoaderCircle } from 'lucide-react'
import WykonanieInterwencjeList from '@/components/diagnozy/egzamin/WykonanieInterwencjeList'
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

// Act-and-document: for each planned intervention the student indicates WHERE
// on the patient it is performed — by clicking the mannequin or a zone button.
export default function WykonanieStep({
  interwencje,
  zones,
  onAssign,
}: {
  interwencje: string[]
  zones: BodyZoneAssignments
  onAssign: (interwencja: string, zone: BodyZone) => void
}) {
  const [active, setActive] = useState<string | null>(
    interwencje.find((item) => !zones[item]) ?? interwencje[0] ?? null
  )

  if (interwencje.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Nie zaznaczono żadnych interwencji — wróć do poprzedniego kroku i zaplanuj
        interwencje, aby wykonać je na fantomie.
      </p>
    )
  }

  const assign = (zone: BodyZone) => {
    if (!active) return
    onAssign(active, zone)
    const next = interwencje.find((item) => item !== active && !zones[item])
    setActive(next ?? active)
  }

  const assignedCount = Object.keys(zones).filter((key) => interwencje.includes(key)).length

  return (
    <div>
      <p className="text-sm text-zinc-600 mb-1">
        Wskaż, gdzie u pacjenta wykonasz każdą z zaplanowanych interwencji.
      </p>
      <p className="text-xs text-zinc-400 mb-4" aria-live="polite">
        Wybierz interwencję, a następnie kliknij część ciała fantomu. Przypisano{' '}
        {assignedCount} z {interwencje.length}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <WykonanieInterwencjeList
          interwencje={interwencje}
          zones={zones}
          active={active}
          onSelect={setActive}
        />

        <div className="min-w-0 order-1 lg:order-2 lg:sticky lg:top-4">
          <MannequinScene
            selectedZone={active ? (zones[active] ?? null) : null}
            onZoneClick={assign}
          />
          <p className="text-xs text-zinc-400 mt-2 mb-1">
            Kliknij część ciała lub wybierz z listy:
          </p>
          <BodyZonePicker
            assignedZone={active ? (zones[active] ?? null) : null}
            onAssign={assign}
          />
        </div>
      </div>
    </div>
  )
}
