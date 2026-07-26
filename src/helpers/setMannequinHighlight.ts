import * as THREE from 'three'

const SELECTED_STRENGTH = 1
const HOVERED_STRENGTH = 0.4

export function setMannequinHighlight(
  geometry: THREE.BufferGeometry,
  vertexZones: number[],
  selectedIndex: number,
  hoveredIndex: number
): void {
  const attribute = geometry.getAttribute('aHighlight') as THREE.BufferAttribute
  const values = attribute.array as Float32Array

  for (let i = 0; i < vertexZones.length; i++) {
    const zone = vertexZones[i]!
    values[i] =
      zone === selectedIndex
        ? SELECTED_STRENGTH
        : zone === hoveredIndex
          ? HOVERED_STRENGTH
          : 0
  }

  attribute.needsUpdate = true
}
