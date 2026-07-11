import { Position, type Node, type Edge } from "@xyflow/react"
import type { MindMapNode as TreeNode } from "@/types/mindmapTypes"
import { radialLayout } from "./radialLayout"
import { treeLayout } from "./treeLayout"
import { treeToFlow, type MindMapNodeData } from "./treeToFlow"

export type LayoutMode = "radial" | "tree"

const EDGE_STYLE = { stroke: "rgba(255,255,255,0.16)", strokeWidth: 1.5 }

/**
 * Turn the mind-map tree into React Flow nodes/edges for the given layout.
 * Tree flows left-to-right (edges leave the parent's right, enter the child's
 * left, smoothstep); radial keeps top/bottom spokes drawn straight.
 */
export function buildFlowGraph(
  root: TreeNode,
  layout: LayoutMode,
  selectedId: string | null
): { nodes: Node<MindMapNodeData>[]; edges: Edge[] } {
  const isTree = layout === "tree"
  const positions = isTree ? treeLayout(root) : radialLayout(root)
  const graph = treeToFlow(root, positions)

  const nodes = graph.nodes.map((n) => ({
    ...n,
    sourcePosition: isTree ? Position.Right : Position.Bottom,
    targetPosition: isTree ? Position.Left : Position.Top,
    ...(n.id === selectedId ? { selected: true } : {}),
  })) as unknown as Node<MindMapNodeData>[]

  const edges = graph.edges.map((e) => ({
    ...e,
    type: isTree ? "smoothstep" : "straight",
    style: EDGE_STYLE,
  })) as unknown as Edge[]

  return { nodes, edges }
}
