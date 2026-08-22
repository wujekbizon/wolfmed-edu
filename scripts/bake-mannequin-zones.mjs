/**
 * scripts/bake-mannequin-zones.mjs
 *
 * Assigns every vertex of mannequin.glb to a BodyZone and writes
 * public/models/mannequin-zones.json.
 *
 * With the map baked, the runtime highlights the real body geometry instead of
 * floating a translucent primitive over it, and clicks raycast the body itself
 * — so the invisible colliders are no longer needed at render time.
 *
 * Classification uses the same ZONE_PARTS volumes, tested most-specific first:
 * the eye spheres sit inside the head sphere, and the plecy box overlaps the
 * chest, so a plain "first hit" over an unordered map would misfile both.
 * Vertices outside every volume (neck, fingertips) take the nearest one.
 *
 * Usage:
 *   node scripts/bake-mannequin-zones.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ZONE_PARTS } from './lib/mannequinZoneParts.mjs'

const TARGET_HEIGHT = 2.4
const MODEL_PATH = path.join(process.cwd(), 'public', 'models', 'mannequin.glb')
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'models', 'mannequin-zones.json')

// Small, distinctive regions first; enclosing volumes last.
const PRIORITY = [
  'oczy',
  'uszy',
  'usta-drogi-oddechowe',
  'glowa',
  'konczyny-gorne',
  'konczyny-dolne',
  'plecy',
  'klatka-piersiowa',
  'brzuch',
  'miednica',
]

function toLocal(point, part) {
  const local = point.clone().sub(new THREE.Vector3(...part.position))
  const [rx, ry, rz] = part.rotation ?? [0, 0, 0]
  if (rx || ry || rz) {
    local.applyEuler(new THREE.Euler(-rx, -ry, -rz, 'ZYX'))
  }
  return local
}

/** Signed-ish distance: <= 0 inside, otherwise roughly how far outside. */
function distanceToPart(point, part) {
  const local = toLocal(point, part)

  if (part.geometry === 'sphere') {
    return local.length() - part.args[0]
  }

  if (part.geometry === 'capsule') {
    const [radius, length] = part.args
    const half = length / 2
    const y = Math.max(-half, Math.min(half, local.y))
    return local.distanceTo(new THREE.Vector3(0, y, 0)) - radius
  }

  const [w, h, d] = part.args
  const dx = Math.abs(local.x) - w / 2
  const dy = Math.abs(local.y) - h / 2
  const dz = Math.abs(local.z) - d / 2
  const outside = new THREE.Vector3(Math.max(dx, 0), Math.max(dy, 0), Math.max(dz, 0))
  return outside.length() + Math.min(Math.max(dx, Math.max(dy, dz)), 0)
}

function classify(point) {
  for (const zone of PRIORITY) {
    for (const part of ZONE_PARTS[zone] ?? []) {
      if (distanceToPart(point, part) <= 0) return zone
    }
  }

  let nearest = null
  let best = Infinity
  for (const zone of PRIORITY) {
    for (const part of ZONE_PARTS[zone] ?? []) {
      const distance = distanceToPart(point, part)
      if (distance < best) {
        best = distance
        nearest = zone
      }
    }
  }
  return nearest
}

const buffer = readFileSync(MODEL_PATH)
const gltf = await new Promise((resolve, reject) =>
  new GLTFLoader().parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    '',
    resolve,
    reject
  )
)

const scene = gltf.scene
scene.updateMatrixWorld(true)

const box = new THREE.Box3().setFromObject(scene)
const size = new THREE.Vector3()
const center = new THREE.Vector3()
box.getSize(size)
box.getCenter(center)
const scale = TARGET_HEIGHT / (size.y || 1)

let mesh = null
scene.traverse((child) => {
  if (child.isMesh && !mesh) mesh = child
})
if (!mesh) throw new Error('No mesh found in mannequin.glb')

const position = mesh.geometry.attributes.position
const zones = [...PRIORITY]
const vertexZones = new Array(position.count)
const counts = {}
const vertex = new THREE.Vector3()

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld)
  vertex.set(
    (vertex.x - center.x) * scale,
    (vertex.y - center.y) * scale,
    (vertex.z - center.z) * scale
  )

  const zone = classify(vertex)
  vertexZones[i] = zones.indexOf(zone)
  counts[zone] = (counts[zone] ?? 0) + 1
}

writeFileSync(
  OUTPUT_PATH,
  `${JSON.stringify({ zones, vertexZones })}\n`,
  'utf-8'
)

console.log(`vertices: ${position.count}`)
for (const zone of zones) {
  const count = counts[zone] ?? 0
  const share = ((count / position.count) * 100).toFixed(1)
  console.log(`  ${zone.padEnd(22)} ${String(count).padStart(6)}  ${share.padStart(5)}%`)
}
console.log(`\nwritten: ${path.relative(process.cwd(), OUTPUT_PATH)}`)
