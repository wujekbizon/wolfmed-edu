'use client'

import MannequinZoneMesh from '@/components/diagnozy/egzamin/mannequin/MannequinZoneMesh'
import type { BodyZone } from '@/types/diagnozyTypes'

type ZoneParts = Parameters<typeof MannequinZoneMesh>[0]['parts']

// Procedural low-poly patient: primitives grouped into clickable regions.
// Order matters — smaller face features are listed after the head so they
// raycast in front of it. plecy/skora/cale-cialo have no mesh (button rail).
const ZONE_PARTS: Partial<Record<BodyZone, ZoneParts>> = {
  glowa: [
    { geometry: 'sphere', position: [0, 1.62, 0], args: [0.27, 24, 24] },
    { geometry: 'capsule', position: [0, 1.33, 0], args: [0.09, 0.1, 8, 16] },
  ],
  oczy: [
    { geometry: 'sphere', position: [-0.1, 1.66, 0.22], args: [0.045, 16, 16] },
    { geometry: 'sphere', position: [0.1, 1.66, 0.22], args: [0.045, 16, 16] },
  ],
  uszy: [
    { geometry: 'sphere', position: [-0.26, 1.6, 0.02], args: [0.055, 16, 16] },
    { geometry: 'sphere', position: [0.26, 1.6, 0.02], args: [0.055, 16, 16] },
  ],
  'usta-drogi-oddechowe': [
    { geometry: 'sphere', position: [0, 1.5, 0.24], args: [0.05, 16, 16] },
  ],
  'klatka-piersiowa': [
    { geometry: 'capsule', position: [0, 0.98, 0], args: [0.3, 0.38, 8, 16] },
  ],
  brzuch: [
    { geometry: 'capsule', position: [0, 0.52, 0], args: [0.26, 0.22, 8, 16] },
  ],
  miednica: [
    { geometry: 'capsule', position: [0, 0.18, 0], args: [0.24, 0.14, 8, 16] },
  ],
  'konczyny-gorne': [
    { geometry: 'capsule', position: [-0.46, 0.9, 0], args: [0.09, 0.72, 8, 16], rotation: [0, 0, 0.28] },
    { geometry: 'capsule', position: [0.46, 0.9, 0], args: [0.09, 0.72, 8, 16], rotation: [0, 0, -0.28] },
  ],
  'konczyny-dolne': [
    { geometry: 'capsule', position: [-0.16, -0.38, 0], args: [0.11, 0.85, 8, 16] },
    { geometry: 'capsule', position: [0.16, -0.38, 0], args: [0.11, 0.85, 8, 16] },
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
