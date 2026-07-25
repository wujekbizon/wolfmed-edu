'use client'

import MannequinGLTF from '@/components/diagnozy/egzamin/mannequin/MannequinGLTF'
import MannequinZoneMesh from '@/components/diagnozy/egzamin/mannequin/MannequinZoneMesh'
import type { BodyZone } from '@/types/diagnozyTypes'

type ZoneParts = Parameters<typeof MannequinZoneMesh>[0]['parts']

// Invisible click-hotspots overlaying the GLB body. Coordinates are for the
// normalized figure from MannequinGLTF: height 2.4, centered at the origin, so
// feet ≈ y -1.2 and head ≈ y +1.2. Tune these fractions in the browser if a
// region doesn't sit on the body; plecy/skora/cale-cialo use the button rail.
const ZONE_PARTS: Partial<Record<BodyZone, ZoneParts>> = {
  glowa: [{ geometry: 'sphere', position: [0, 1.02, 0], args: [0.22, 20, 20] }],
  oczy: [
    { geometry: 'sphere', position: [-0.08, 1.06, 0.16], args: [0.05, 12, 12] },
    { geometry: 'sphere', position: [0.08, 1.06, 0.16], args: [0.05, 12, 12] },
  ],
  uszy: [
    { geometry: 'sphere', position: [-0.2, 1.02, 0], args: [0.06, 12, 12] },
    { geometry: 'sphere', position: [0.2, 1.02, 0], args: [0.06, 12, 12] },
  ],
  'usta-drogi-oddechowe': [
    { geometry: 'sphere', position: [0, 0.9, 0.16], args: [0.06, 12, 12] },
  ],
  'klatka-piersiowa': [
    { geometry: 'capsule', position: [0, 0.5, 0], args: [0.3, 0.32, 8, 16] },
  ],
  brzuch: [{ geometry: 'capsule', position: [0, 0.12, 0], args: [0.27, 0.22, 8, 16] }],
  miednica: [{ geometry: 'capsule', position: [0, -0.2, 0], args: [0.27, 0.16, 8, 16] }],
  'konczyny-gorne': [
    { geometry: 'capsule', position: [-0.5, 0.35, 0], args: [0.12, 0.75, 8, 16], rotation: [0, 0, 0.18] },
    { geometry: 'capsule', position: [0.5, 0.35, 0], args: [0.12, 0.75, 8, 16], rotation: [0, 0, -0.18] },
  ],
  'konczyny-dolne': [
    { geometry: 'capsule', position: [-0.17, -0.72, 0], args: [0.14, 0.85, 8, 16] },
    { geometry: 'capsule', position: [0.17, -0.72, 0], args: [0.14, 0.85, 8, 16] },
  ],
  // Sits behind the torso so the chest/abdomen colliders still win from the
  // front; it only becomes the nearest hit once the camera swings around.
  plecy: [{ geometry: 'box', position: [0, 0.3, -0.16], args: [0.5, 1.05, 0.14] }],
}

export default function MannequinModel({
  selectedZone,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  onZoneClick: (zone: BodyZone) => void
}) {
  return (
    <group>
      <MannequinGLTF />
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
