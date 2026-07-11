import { hierarchy, tree } from "d3-hierarchy"
import type { MindMapNode } from "./types"
import type { LayoutPosition } from "./radialLayout"

export interface TreeLayoutOptions {
  /** Vertical gap between siblings. */
  rowGap?: number
  /** Horizontal gap between depth levels. */
  columnGap?: number
}

/**
 * Left-to-right tidy tree layout via d3-hierarchy — better than radial for deep,
 * narrow topics. Collapsed subtrees are excluded (same as radialLayout). Pure.
 */
export function treeLayout(
  root: MindMapNode,
  options: TreeLayoutOptions = {}
): Map<string, LayoutPosition> {
  // Rows must clear the largest node diameter (in-node labels, no pill below).
  const rowGap = options.rowGap ?? 132
  const columnGap = options.columnGap ?? 240

  const h = hierarchy<MindMapNode>(root, (n) => (n.collapsed ? null : n.children))
  tree<MindMapNode>().nodeSize([rowGap, columnGap])(h)

  const positions = new Map<string, LayoutPosition>()
  h.each((node) => {
    // d3 lays out top-down (x = cross axis, y = depth); swap for left-to-right.
    positions.set(node.data.id, { x: node.y ?? 0, y: node.x ?? 0 })
  })
  return positions
}
