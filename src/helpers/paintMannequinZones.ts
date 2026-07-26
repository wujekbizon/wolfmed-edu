import * as THREE from 'three'
import { getZoneDebugColor } from '@/helpers/getZoneDebugColor'

// Multiplied over the skin texture, so these lighten toward rose rather than
// replacing the colour — a flat rose fill reads as a sticker on the body.
const SELECTED: [number, number, number] = [1, 0.42, 0.52]
const HOVERED: [number, number, number] = [1, 0.74, 0.79]
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
