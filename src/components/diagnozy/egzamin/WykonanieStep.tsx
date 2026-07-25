'use client'

import { useState } from 'react'
import WykonanieInterwencjeList from '@/components/diagnozy/egzamin/WykonanieInterwencjeList'
import WykonanieMannequinPanel from '@/components/diagnozy/egzamin/WykonanieMannequinPanel'
import type { BodyZone, BodyZoneAssignments } from '@/types/diagnozyTypes'

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
  const activeIndex = active ? interwencje.indexOf(active) : -1

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

        <WykonanieMannequinPanel
          interwencje={interwencje}
          zones={zones}
          active={active}
          activeIndex={activeIndex}
          onSelect={setActive}
          onAssign={assign}
        />
      </div>
    </div>
  )
}
