'use client'

import { useState } from 'react'
import type { BodyZone } from '@/types/diagnozyTypes'

const BASE_COLOR = '#d6c3b6'
const HOVER_COLOR = '#fda4af'
const SELECTED_COLOR = '#f43f5e'

type Part = {
  geometry: 'sphere' | 'capsule' | 'box'
  position: [number, number, number]
  args: number[]
  rotation?: [number, number, number]
}

// One clickable body zone: a group of primitive meshes sharing hover/selected
// color state. Swapping to a rigged GLTF later only replaces the geometry.
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
  const color = selected ? SELECTED_COLOR : hovered ? HOVER_COLOR : BASE_COLOR

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
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
