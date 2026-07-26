'use client'

import MannequinGLTF from '@/components/diagnozy/egzamin/mannequin/MannequinGLTF'
import MannequinZoneMesh from '@/components/diagnozy/egzamin/mannequin/MannequinZoneMesh'
import { ZONE_PARTS } from '@/constants/mannequinZones'
import type { BodyZone } from '@/types/diagnozyTypes'
import type { ZonePart } from '@/types/mannequinTypes'

export default function MannequinModel({
  selectedZone,
  debug,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  debug: boolean
  onZoneClick: (zone: BodyZone) => void
}) {
  return (
    <group>
      <MannequinGLTF />
      {(Object.entries(ZONE_PARTS) as [BodyZone, ZonePart[]][]).map(([zone, parts]) => (
        <MannequinZoneMesh
          key={zone}
          zone={zone}
          parts={parts}
          selected={selectedZone === zone}
          debug={debug}
          onClick={onZoneClick}
        />
      ))}
    </group>
  )
}
