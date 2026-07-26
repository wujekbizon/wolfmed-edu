'use client'

import { useState } from 'react'
import WykonanieInterwencjeList from '@/components/diagnozy/egzamin/WykonanieInterwencjeList'
import WykonanieMannequinPanel from '@/components/diagnozy/egzamin/WykonanieMannequinPanel'
import WykonanieSidePanel from '@/components/diagnozy/egzamin/WykonanieSidePanel'
import type { BodyZone, BodyZoneAssignments } from '@/types/diagnozyTypes'

// Act-and-document: for each planned intervention the student indicates WHERE
// on the patient it is performed. The patient is the workspace — the case and
// the intervention list support it rather than compete with it.
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
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem] gap-6 items-start">
        <WykonanieMannequinPanel
          selectedZone={active ? (zones[active] ?? null) : null}
          onAssign={assign}
        />

        <div className="lg:sticky lg:top-4">
          <WykonanieSidePanel
            interwencje={interwencje}
            zones={zones}
            active={active}
            activeIndex={activeIndex}
            assignedCount={assignedCount}
            onSelect={setActive}
            onAssign={assign}
          />
        </div>
      </div>

      <WykonanieInterwencjeList
        interwencje={interwencje}
        zones={zones}
        active={active}
        onSelect={setActive}
      />
    </div>
  )
}
