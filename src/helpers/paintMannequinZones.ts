import * as THREE from 'three'
import { getZoneDebugColor } from '@/helpers/getZoneDebugColor'

// Vertex colours multiply the skin, so a rose tint only ever darkens a brown
// model — the selection read as a muddy stain. Values above 1 brighten
// instead, lifting the region toward a cool white so it reads as illuminated
// against the tan body rather than painted over it.
const SELECTED: [number, number, number] = [2.1, 2.35, 2.6]
const HOVERED: [number, number, number] = [1.35, 1.45, 1.55]
const NEUTRAL: [number, number, number] = [1, 1, 1]

export function paintMannequinZones(
  geometry: THREE.BufferGeometry,
  vertexZones: number[],
  selectedIndex: number,
  hoveredIndex: number,
  debug: boolean,
  zones: string[]
): void {
  const attribute = geometry.getAttribute('color') as THREE.BufferAttribute
  const colors = attribute.array as Float32Array
  const debugColor = new THREE.Color()

  for (let i = 0; i < vertexZones.length; i++) {
    const zone = vertexZones[i]!
    let rgb = NEUTRAL

    if (debug) {
      debugColor.set(getZoneDebugColor(zones[zone] ?? ''))
      rgb = [debugColor.r, debugColor.g, debugColor.b]
    } else if (zone === selectedIndex) {
      rgb = SELECTED
    } else if (zone === hoveredIndex) {
      rgb = HOVERED
    }

    colors[i * 3] = rgb[0]
    colors[i * 3 + 1] = rgb[1]
    colors[i * 3 + 2] = rgb[2]
  }

  attribute.needsUpdate = true
}
