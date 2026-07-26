'use client'

import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { buildMannequinGeometry } from '@/helpers/buildMannequinGeometry'
import { paintMannequinZones } from '@/helpers/paintMannequinZones'
import type { BodyZone } from '@/types/diagnozyTypes'
import type { MannequinZoneMap } from '@/types/mannequinTypes'

const MODEL_URL = '/models/mannequin.glb'
const ZONE_MAP_URL = '/models/mannequin-zones.json'

// The body is one mesh, so the highlight is painted into a vertex-colour
// attribute keyed by the baked vertex→zone map. That gives the region the
// exact silhouette of the limb instead of a primitive floating over it, and
// lets clicks raycast the real geometry.
export default function MannequinBody({
  selectedZone,
  debug,
  onZoneClick,
}: {
  selectedZone: BodyZone | null
  debug: boolean
  onZoneClick: (zone: BodyZone) => void
}) {
  const { scene } = useGLTF(MODEL_URL)
  const zoneMap = useLoader(THREE.FileLoader, ZONE_MAP_URL) as unknown as string
  const [hovered, setHovered] = useState<number>(-1)

  const { zones, vertexZones } = useMemo(
    () => JSON.parse(zoneMap) as MannequinZoneMap,
    [zoneMap]
  )

  const geometry = useMemo(() => buildMannequinGeometry(scene), [scene])

  const material = useMemo(() => {
    let source: THREE.Material | null = null
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh
      if (mesh.isMesh && !source) source = mesh.material as THREE.Material
    })
    const cloned = (source as unknown as THREE.MeshStandardMaterial).clone()
    cloned.vertexColors = true
    return cloned
  }, [scene])

  const selectedIndex = selectedZone ? zones.indexOf(selectedZone) : -1

  useEffect(() => {
    paintMannequinZones(geometry, vertexZones, selectedIndex, hovered, debug, zones)
  }, [geometry, vertexZones, selectedIndex, hovered, debug, zones])

  useEffect(() => {
    document.body.style.cursor = hovered >= 0 ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  const zoneAt = (face: THREE.Face | null | undefined) =>
    face ? (vertexZones[face.a] ?? -1) : -1

  return (
    <mesh
      geometry={geometry}
      material={material}
      onPointerMove={(event) => {
        event.stopPropagation()
        setHovered(zoneAt(event.face))
      }}
      onPointerOut={() => setHovered(-1)}
      onClick={(event) => {
        event.stopPropagation()
        const zone = zones[zoneAt(event.face)]
        if (zone) onZoneClick(zone as BodyZone)
      }}
    />
  )
}

useGLTF.preload(MODEL_URL)
