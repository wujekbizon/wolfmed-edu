/**
 * scripts/prune-mannequin.mjs
 *
 * Reduces a multi-figure Sketchfab human glb to the single low-poly non-rigged
 * male figure used by the exam mannequin, then welds/dedups/prunes it.
 *
 * Usage:  node scripts/prune-mannequin.mjs <input.glb> [output.glb]
 * Default output: public/models/mannequin.glb
 */
import { NodeIO } from '@gltf-transform/core'
import { prune, weld, dedup } from '@gltf-transform/functions'

const input = process.argv[2]
const output = process.argv[3] ?? 'public/models/mannequin.glb'
if (!input) {
  console.error('Usage: node scripts/prune-mannequin.mjs <input.glb> [output.glb]')
  process.exit(1)
}

const io = new NodeIO()
const doc = await io.read(input)
const root = doc.getRoot()
const scenes = root.listScenes()
const KEEP = 'Man (NonRig)'

for (const node of root.listNodes()) {
  const name = node.getName() || ''
  if (/^(Woman|Man)\s/.test(name) && !name.startsWith(KEEP)) {
    const parent = node.getParentNode?.() ?? null
    if (parent) parent.removeChild(node)
    for (const s of scenes) s.removeChild(node)
  }
}

await doc.transform(prune(), weld(), dedup())
await io.write(output, doc)
console.log('wrote', output, '— meshes:', root.listMeshes().map((m) => m.getName()))
