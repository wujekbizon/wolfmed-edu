'use client'

import { useState } from 'react'
import type { BodyZone } from '@/types/diagnozyTypes'

// Rose tint shown over the region on hover / when selected. Idle opacity is 0
// so the real body shows through — but the mesh still raycasts (geometry-based),
// so it stays clickable while invisible.
const TINT = '#f43f5e'

type Part = {
  geometry: 'sphere' | 'capsule' | 'box'
  position: [number, number, number]
  args: number[]
  rotation?: [number, number, number]
}

// One clickable body zone: invisible collider group overlaying the GLB body.
// The visible mesh carries no handlers, so r3f routes the click here.
export default function MannequinZoneMesh({
  zone,
  parts,
  selected,
  onClick,
}: {
  zone: BodyZone
  parts: Part[]
  selected: boolean
  onClick: (zone: BodyZone) => void
}) {
  const [hovered, setHovered] = useState(false)
  const opacity = selected ? 0.5 : hovered ? 0.3 : 0

  return (
    <group
      onClick={(event) => {
        event.stopPropagation()
        onClick(zone)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {parts.map((part, index) => (
        <mesh key={index} position={part.position} rotation={part.rotation ?? [0, 0, 0]}>
          {part.geometry === 'sphere' && (
            <sphereGeometry args={part.args as [number, number, number]} />
          )}
          {part.geometry === 'capsule' && (
            <capsuleGeometry args={part.args as [number, number, number, number]} />
          )}
          {part.geometry === 'box' && (
            <boxGeometry args={part.args as [number, number, number]} />
          )}
          <meshBasicMaterial
            color={TINT}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}
