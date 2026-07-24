'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { LoaderCircle } from 'lucide-react'
import { BODY_ZONES, BODY_ZONE_LABELS } from '@/types/diagnozyTypes'
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

  return (
    <div>
      <p className="text-sm text-zinc-600 mb-1">
        Wskaż, gdzie u pacjenta wykonasz każdą z zaplanowanych interwencji.
      </p>
      <p className="text-xs text-zinc-400 mb-4" aria-live="polite">
        Wybierz interwencję, a następnie kliknij część ciała fantomu.{' '}
        Przypisano {Object.keys(zones).filter((key) => interwencje.includes(key)).length} z{' '}
        {interwencje.length}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          {interwencje.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setActive(item)}
              aria-pressed={active === item}
              className={`text-left p-3 rounded-xl border text-sm transition-all cursor-pointer
                ${
                  active === item
                    ? 'border-rose-300 bg-rose-50/70 shadow-sm text-zinc-800'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-600'
                }`}
            >
              <span className="block min-w-0">{item}</span>
              {zones[item] && (
                <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                  {BODY_ZONE_LABELS[zones[item]]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="min-w-0">
          <MannequinScene
            selectedZone={active ? (zones[active] ?? null) : null}
            onZoneClick={assign}
          />
          <p className="text-xs text-zinc-400 mt-2 mb-1">
            Kliknij część ciała lub wybierz z listy:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BODY_ZONES.map((zone) => {
              const isActiveAssignment = !!active && zones[active] === zone
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => assign(zone)}
                  aria-pressed={isActiveAssignment}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer
                    ${
                      isActiveAssignment
                        ? 'bg-rose-500 text-white'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-rose-100 hover:text-rose-700'
                    }`}
                >
                  {BODY_ZONE_LABELS[zone]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
