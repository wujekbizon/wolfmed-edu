import type { MindMapNode } from "@/types/mindmapTypes"

export interface LayoutPosition {
  x: number
  y: number
}

export interface RadialLayoutOptions {
  centerX?: number
  centerY?: number
  /** Minimum center-to-center distance enforced between any two nodes. */
  minSeparation?: number
  /** Radial distance added per depth level (before crowding). */
  ringStep?: number
}

export const MIN_NODE_SEPARATION = 100
const DEFAULT_RING_STEP = 220
const TWO_PI = Math.PI * 2

/** Children that participate in layout — a collapsed node hides its subtree. */
function visibleChildren(node: MindMapNode): MindMapNode[] {
  return node.collapsed ? [] : node.children
}

/** Count of visible leaves under a node (a collapsed node counts as one leaf). */
function countLeaves(node: MindMapNode): number {
  const kids = visibleChildren(node)
  if (kids.length === 0) return 1
  return kids.reduce((sum, child) => sum + countLeaves(child), 0)
}

function maxVisibleDepth(node: MindMapNode): number {
  const kids = visibleChildren(node)
  if (kids.length === 0) return node.depth
  return Math.max(...kids.map(maxVisibleDepth))
}

/**
 * Pure radial layout. Places the root at the center and fans visible descendants
 * outward, giving each branch an angular slice proportional to its visible-leaf
 * count so crowded branches never squeeze thin ones. Ring spacing scales with the
 * tree's leaf count so the outermost ring always has room, then a light
 * relaxation pass guarantees the minimum-separation invariant. No DOM, unit-testable.
 */
export function radialLayout(
  root: MindMapNode,
  options: RadialLayoutOptions = {}
): Map<string, LayoutPosition> {
  const centerX = options.centerX ?? 0
  const centerY = options.centerY ?? 0
  const minSep = options.minSeparation ?? MIN_NODE_SEPARATION
  const positions = new Map<string, LayoutPosition>()

  const totalLeaves = countLeaves(root)
  const depthSpan = Math.max(1, maxVisibleDepth(root))

  // Ring spacing large enough that adjacent leaves on the outermost ring stay
  // at least minSep apart (chord length), with a sensible floor for small trees.
  const requiredOuterRadius =
    totalLeaves > 1 ? minSep / (2 * Math.sin(Math.PI / totalLeaves)) : 0
  const ringStep = Math.max(
    options.ringStep ?? DEFAULT_RING_STEP,
    minSep,
    requiredOuterRadius / depthSpan
  )

  const depthById = new Map<string, number>()

  function place(node: MindMapNode, startAngle: number, endAngle: number) {
    const angle = (startAngle + endAngle) / 2
    const radius = node.depth * ringStep
    positions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
    depthById.set(node.id, node.depth)

    const kids = visibleChildren(node)
    if (kids.length === 0) return

    const leavesHere = countLeaves(node)
    let cursor = startAngle
    for (const child of kids) {
      const slice = ((endAngle - startAngle) * countLeaves(child)) / leavesHere
      place(child, cursor, cursor + slice)
      cursor += slice
    }
  }

  place(root, 0, TWO_PI)
  relax(positions, depthById, root.id, minSep)
  return positions
}

/**
 * Iterative relaxation: nudges any pair closer than minSep apart along their
 * connecting axis. The root stays pinned so the map keeps its center. Converges
 * quickly because the radial base layout is already near-separated.
 */
function relax(
  positions: Map<string, LayoutPosition>,
  depthById: Map<string, number>,
  rootId: string,
  minSep: number
) {
  const ids = [...positions.keys()]
  const MAX_ITERATIONS = 80

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    let moved = false
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const idA = ids[i]!
        const idB = ids[j]!
        const a = positions.get(idA)!
        const b = positions.get(idB)!
        const dx = b.x - a.x
        const dy = b.y - a.y
        const dist = Math.hypot(dx, dy)
        if (dist >= minSep) continue

        const ux = dist > 1e-6 ? dx / dist : Math.cos(i)
        const uy = dist > 1e-6 ? dy / dist : Math.sin(i)
        const overlap = minSep - Math.max(dist, 1e-6)
        const aPinned = idA === rootId
        const bPinned = idB === rootId
        const push = aPinned || bPinned ? overlap : overlap / 2

        if (!aPinned) {
          a.x -= ux * push
          a.y -= uy * push
        }
        if (!bPinned) {
          b.x += ux * push
          b.y += uy * push
        }
        moved = true
      }
    }
    if (!moved) break
  }
}
