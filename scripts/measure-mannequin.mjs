import { readFileSync } from 'node:fs'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const TARGET_HEIGHT = 2.4
const buffer = readFileSync('public/models/mannequin.glb')
const loader = new GLTFLoader()

const gltf = await new Promise((resolve, reject) =>
  loader.parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    '',
    resolve,
    reject
  )
)

const scene = gltf.scene
const box = new THREE.Box3().setFromObject(scene)
const size = new THREE.Vector3()
const center = new THREE.Vector3()
box.getSize(size)
box.getCenter(center)
const scale = TARGET_HEIGHT / (size.y || 1)

console.log('raw size   ', size.toArray().map((n) => n.toFixed(3)).join(', '))
console.log('raw center ', center.toArray().map((n) => n.toFixed(3)).join(', '))
console.log('scale      ', scale.toFixed(4))

// Collect every vertex in the same normalized space MannequinGLTF produces.
const points = []
scene.updateMatrixWorld(true)
scene.traverse((child) => {
  if (!child.isMesh) return
  const pos = child.geometry.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(child.matrixWorld)
    points.push([
      (v.x - center.x) * scale,
      (v.y - center.y) * scale,
      (v.z - center.z) * scale,
    ])
  }
})

console.log('vertices   ', points.length)

const BANDS = 24
const minY = -TARGET_HEIGHT / 2
const step = TARGET_HEIGHT / BANDS

console.log('\ny-range        | xMin   xMax  | zMin   zMax  | x-clusters (gap>0.06)')
for (let b = 0; b < BANDS; b++) {
  const lo = minY + b * step
  const hi = lo + step
  const band = points.filter((p) => p[1] >= lo && p[1] < hi)
  if (band.length === 0) continue

  const xs = band.map((p) => p[0]).sort((a, b2) => a - b2)
  const zs = band.map((p) => p[2])
  const clusters = []
  let start = xs[0]
  let prev = xs[0]
  for (const x of xs) {
    if (x - prev > 0.06) {
      clusters.push([start, prev])
      start = x
    }
    prev = x
  }
  clusters.push([start, prev])

  const f = (n) => n.toFixed(2).padStart(6)
  console.log(
    `${f(lo)}..${f(hi)} |${f(xs[0])}${f(xs[xs.length - 1])} |${f(Math.min(...zs))}${f(Math.max(...zs))} | ` +
      clusters.map(([a, c]) => `[${a.toFixed(2)}, ${c.toFixed(2)}]`).join(' ')
  )
}
