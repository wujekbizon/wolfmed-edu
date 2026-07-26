import * as THREE from 'three'
import { getZoneDebugColor } from '@/helpers/getZoneDebugColor'

const NEUTRAL = new THREE.Color(1, 1, 1)

/** Debug view only: recolours the body by zone to verify the baked map. */
export function paintMannequinZones(
  geometry: THREE.BufferGeometry,
  vertexZones: number[],
  debug: boolean,
  zones: string[]
): void {
  const attribute = geometry.getAttribute('color') as THREE.BufferAttribute
  const colors = attribute.array as Float32Array
  const color = new THREE.Color()

  for (let i = 0; i < vertexZones.length; i++) {
    const rgb = debug ? color.set(getZoneDebugColor(zones[vertexZones[i]!] ?? '')) : NEUTRAL
    colors[i * 3] = rgb.r
    colors[i * 3 + 1] = rgb.g
    colors[i * 3 + 2] = rgb.b
  }

  attribute.needsUpdate = true
}
