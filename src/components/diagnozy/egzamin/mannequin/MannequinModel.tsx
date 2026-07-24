'use client'

import MannequinZoneMesh from '@/components/diagnozy/egzamin/mannequin/MannequinZoneMesh'
import type { BodyZone } from '@/types/diagnozyTypes'

type ZoneParts = Parameters<typeof MannequinZoneMesh>[0]['parts']

// Procedural low-poly patient: primitives grouped into clickable zones.
// 'cale-cialo' has no mesh — it's assigned via the zone buttons under the canvas.
const ZONE_PARTS: Partial<Record<BodyZone, ZoneParts>> = {
  glowa: [
    { geometry: 'sphere', position: [0, 1.62, 0], args: [0.27, 24, 24] },
    { geometry: 'capsule', position: [0, 1.32, 0], args: [0.09, 0.12, 8, 16] },
  ],
  'klatka-piersiowa': [
    { geometry: 'capsule', position: [0, 0.98, 0], args: [0.3, 0.42, 8, 16] },
  ],
  brzuch: [
    { geometry: 'capsule', position: [0, 0.48, 0], args: [0.26, 0.28, 8, 16] },
  ],
  reka: [
    {
      geometry: 'capsule',
      position: [-0.46, 0.88, 0],
      args: [0.09, 0.72, 8, 16],
      rotation: [0, 0, 0.28],
    },
    {
      geometry: 'capsule',
      position: [0.46, 0.88, 0],
      args: [0.09, 0.72, 8, 16],
      rotation: [0, 0, -0.28],
    },
  ],
  noga: [
    { geometry: 'capsule', position: [-0.16, -0.35, 0], args: [0.11, 0.85, 8, 16] },
    { geometry: 'capsule', position: [0.16, -0.35, 0], args: [0.11, 0.85, 8, 16] },
  ],
}

export default function MannequinModel({
  selectedZone,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
}) {
  return (
    <group position={[0, -0.35, 0]}>
      {(Object.entries(ZONE_PARTS) as [BodyZone, ZoneParts][]).map(([zone, parts]) => (
        <MannequinZoneMesh
          key={zone}
          zone={zone}
          parts={parts}
          selected={selectedZone === zone}
          onClick={onZoneClick}
        />
      ))}
    </group>
  )
}
