import type { Category, MasteryLevel, MindMapNode, TopicType } from "@/types/mindmapTypes"
import type { LayoutPosition } from "./radialLayout"
import { ROOT_COLOR, getCategoryColor, getDepthSize, lightenColor } from "./design"

// Structurally compatible with @xyflow/react's Node<data> / Edge, but declared
// here so the pure engine carries no dependency on the rendering library. The
// canvas component adapts these directly.
export interface MindMapNodeData {
  label: string
  depth: number
  color: string
  category: Category | undefined
  topicType: TopicType | undefined
  masteryLevel: MasteryLevel | undefined
  collapsed: boolean
  isLeaf: boolean
  hiddenCount: number
  // Set by buildFlowGraph when a selection exists and this node is off the
  // root→selected path; the node renderer fades it.
  dimmed?: boolean
  // Index signature so this satisfies @xyflow/react's Node<T> data constraint.
  [key: string]: unknown
}

export interface FlowNode {
  id: string
  type: string
  position: LayoutPosition
  data: MindMapNodeData
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  type: string
}

export interface FlowGraph {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

function countDescendants(node: MindMapNode): number {
  return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
}

// Depth 0 is the root color, depth 1 takes the category color (drives the icon
// hue), deeper nodes inherit a lightened parent color — computed once here.
function computeColor(node: MindMapNode, parentColor: string): string {
  if (node.depth <= 0) return ROOT_COLOR
  if (node.depth === 1) return getCategoryColor(node.metadata?.category)
  return lightenColor(parentColor, 0.16)
}

/**
 * Converts a mind-map tree (plus a positions map from radialLayout) into flat
 * node/edge arrays for the canvas. Collapsed subtrees are pruned — their hidden
 * descendant count travels on the collapsed node's data as `hiddenCount`.
 */
export function treeToFlow(
  root: MindMapNode,
  positions: Map<string, LayoutPosition>
): FlowGraph {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  function walk(node: MindMapNode, parentColor: string) {
    const color = computeColor(node, parentColor)
    const kids = node.collapsed ? [] : node.children

    // radialLayout returns circle centers; React Flow anchors nodes by their
    // top-left corner, so offset by half the node size to center the circle.
    const center = positions.get(node.id) ?? { x: 0, y: 0 }
    const half = getDepthSize(node.depth) / 2

    nodes.push({
      id: node.id,
      type: "mindmap",
      position: { x: center.x - half, y: center.y - half },
      data: {
        label: node.label,
        depth: node.depth,
        color,
        category: node.metadata?.category,
        topicType: node.metadata?.topicType,
        masteryLevel: node.metadata?.masteryLevel,
        collapsed: Boolean(node.collapsed),
        isLeaf: kids.length === 0,
        hiddenCount: node.collapsed ? countDescendants(node) : 0,
      },
    })

    for (const child of kids) {
      edges.push({
        id: `${node.id}->${child.id}`,
        source: node.id,
        target: child.id,
        type: "straight",
      })
      walk(child, color)
    }
  }

  walk(root, ROOT_COLOR)
  return { nodes, edges }
}
