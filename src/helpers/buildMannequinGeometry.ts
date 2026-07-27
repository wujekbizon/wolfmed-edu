import * as THREE from 'three'

const MANNEQUIN_HEIGHT = 2.4

/**
 * Bakes the GLB into a single origin-centred geometry of a known height, so the
 * vertex→zone map produced by bake-mannequin-zones.mjs lines up regardless of
 * how the source model was authored. Adds the colour attribute the highlight
 * writes into.
 */
export function buildMannequinGeometry(scene: THREE.Object3D): THREE.BufferGeometry {
  scene.updateMatrixWorld(true)

  let source: THREE.Mesh | null = null
  scene.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && !source) source = child as THREE.Mesh
  })
  if (!source) throw new Error('mannequin.glb contains no mesh')

  const mesh = source as THREE.Mesh
  const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld)

  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)

  const scale = MANNEQUIN_HEIGHT / (size.y || 1)
  geometry.translate(-center.x, -center.y, -center.z)
  geometry.scale(scale, scale, scale)

  const count = geometry.getAttribute('position').count

  // Selection strength per vertex, added as emissive light by the material.
  // Brightening through vertex colours instead would multiply the skin texture
  // and, above 1, expose the model's palette atlas as coloured blocks.
  geometry.setAttribute('aHighlight', new THREE.BufferAttribute(new Float32Array(count), 1))

  // Only used by the debug view, which recolours the body by zone.
  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(count * 3).fill(1), 3)
  )

  return geometry
}
