import { Position, type Node, type Edge } from "@xyflow/react"
import type { MindMapNode as TreeNode } from "@/types/mindmapTypes"
import { radialLayout } from "./radialLayout"
import { treeLayout } from "./treeLayout"
import { treeToFlow, type MindMapNodeData } from "./treeToFlow"
import { getNodePathIds } from "./treeOps"
import { getDepthSize } from "./design"

export type LayoutMode = "radial" | "tree"

const EDGE_STYLE = { stroke: "rgba(255,255,255,0.16)", strokeWidth: 1.5 }
const EDGE_STYLE_ON_PATH = { stroke: "rgba(255,255,255,0.5)", strokeWidth: 2 }
const EDGE_STYLE_DIMMED = { stroke: "rgba(255,255,255,0.07)", strokeWidth: 1.5 }

/**
 * Turn the mind-map tree into React Flow nodes/edges for the given layout.
 * Tree flows left-to-right (edges leave the parent's right, enter the child's
 * left, smoothstep); radial keeps top/bottom spokes drawn straight.
 *
 * With a selection, edges on the root→selected path are highlighted and the
 * rest dimmed; off-path nodes carry `dimmed` for the node renderer to fade.
 * Nodes get explicit width/height (sizes are deterministic per depth) so the
 * camera can frame freshly expanded nodes before the DOM measures them.
 */
export function buildFlowGraph(
  root: TreeNode,
  layout: LayoutMode,
  selectedId: string | null
): { nodes: Node<MindMapNodeData>[]; edges: Edge[] } {
  const isTree = layout === "tree"
  const positions = isTree ? treeLayout(root) : radialLayout(root)
  const graph = treeToFlow(root, positions)
  const pathIds = selectedId ? getNodePathIds(root, selectedId) : null
  const onPath = new Set(pathIds ?? [])

  const nodes = graph.nodes.map((n) => {
    const size = getDepthSize(n.data.depth)
    return {
      ...n,
      width: size,
      height: size,
      sourcePosition: isTree ? Position.Right : Position.Bottom,
      targetPosition: isTree ? Position.Left : Position.Top,
      data: { ...n.data, dimmed: Boolean(pathIds && !onPath.has(n.id)) },
      ...(n.id === selectedId ? { selected: true } : {}),
    }
  }) as unknown as Node<MindMapNodeData>[]

  const edges = graph.edges.map((e) => {
    const isOnPath = onPath.has(e.source) && onPath.has(e.target)
    return {
      ...e,
      type: isTree ? "smoothstep" : "straight",
      style: isOnPath ? EDGE_STYLE_ON_PATH : pathIds ? EDGE_STYLE_DIMMED : EDGE_STYLE,
    }
  }) as unknown as Edge[]

  return { nodes, edges }
}
