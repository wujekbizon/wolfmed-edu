import test from "node:test"
import assert from "node:assert/strict"
import { radialLayout, MIN_NODE_SEPARATION } from "../radialLayout"
import { treeToFlow } from "../treeToFlow"
import { collapseBelowDepth } from "../treeOps"
import type { MindMapNode } from "../types"

function node(id: string, depth: number, children: MindMapNode[] = []): MindMapNode {
  return { id, label: id, parentId: null, depth, children }
}

/** Root + 6 branches × 3 children × 2 leaves = 61 nodes across 3 levels. */
function buildTree(): MindMapNode {
  const branches: MindMapNode[] = []
  for (let b = 0; b < 6; b++) {
    const children: MindMapNode[] = []
    for (let c = 0; c < 3; c++) {
      const leaves = [node(`b${b}c${c}l0`, 3), node(`b${b}c${c}l1`, 3)]
      children.push(node(`b${b}c${c}`, 2, leaves))
    }
    branches.push(node(`b${b}`, 1, children))
  }
  return node("root", 0, branches)
}

function assertNoOverlap(positions: Map<string, { x: number; y: number }>) {
  const entries = [...positions.entries()]
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [idA, a] = entries[i]!
      const [idB, b] = entries[j]!
      const dist = Math.hypot(b.x - a.x, b.y - a.y)
      assert.ok(
        dist >= MIN_NODE_SEPARATION - 1e-6,
        `${idA} and ${idB} overlap: ${dist.toFixed(2)} < ${MIN_NODE_SEPARATION}`
      )
    }
  }
}

test("radialLayout keeps every node pair at least MIN_NODE_SEPARATION apart (61-node tree)", () => {
  const positions = radialLayout(buildTree())
  assert.equal(positions.size, 61)
  assertNoOverlap(positions)
})

test("radialLayout places the root at the requested center", () => {
  const positions = radialLayout(buildTree(), { centerX: 500, centerY: 300 })
  const root = positions.get("root")!
  assert.equal(root.x, 500)
  assert.equal(root.y, 300)
})

test("radialLayout excludes collapsed subtrees from positioning", () => {
  const tree = buildTree()
  tree.children[0]!.collapsed = true
  const positions = radialLayout(tree)
  // b0's 3 children + 6 leaves = 9 hidden nodes.
  assert.equal(positions.size, 61 - 9)
  assert.ok(!positions.has("b0c0"))
  assert.ok(positions.has("b0"))
  assertNoOverlap(positions)
})

test("treeToFlow prunes collapsed subtree and carries hidden count", () => {
  const tree = buildTree()
  tree.children[1]!.collapsed = true
  const positions = radialLayout(tree)
  const { nodes, edges } = treeToFlow(tree, positions)

  assert.equal(nodes.length, 61 - 9)
  const collapsed = nodes.find((n) => n.id === "b1")!
  assert.equal(collapsed.data.collapsed, true)
  assert.equal(collapsed.data.hiddenCount, 9)
  // No edge should point into the hidden subtree.
  assert.ok(!edges.some((e) => e.source === "b1"))
})

test("collapseBelowDepth collapses branches so only the first ring renders", () => {
  const collapsed = collapseBelowDepth(buildTree(), 1)
  const positions = radialLayout(collapsed)
  // root + 6 depth-1 branches visible; everything deeper hidden.
  assert.equal(positions.size, 7)
  assert.ok(positions.has("root"))
  assert.ok(positions.has("b0"))
  assert.ok(!positions.has("b0c0"))
  // each visible branch is marked collapsed with a hidden count.
  const { nodes } = treeToFlow(collapsed, positions)
  const branch = nodes.find((n) => n.id === "b0")!
  assert.equal(branch.data.collapsed, true)
  assert.equal(branch.data.hiddenCount, 9)
})

test("treeToFlow assigns root, branch and inherited colors by depth", () => {
  const tree = buildTree()
  const positions = radialLayout(tree)
  const { nodes } = treeToFlow(tree, positions)
  const root = nodes.find((n) => n.id === "root")!
  const branch = nodes.find((n) => n.id === "b0")!
  assert.match(root.data.color, /^#/)
  assert.match(branch.data.color, /^#/)
  assert.equal(root.data.depth, 0)
})
