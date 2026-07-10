"use client"

import "@xyflow/react/dist/style.css"
import { useCallback, useMemo, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  NodeToolbar,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react"
import type { MindMapNode as TreeNode, MasteryLevel } from "@/lib/mindmap/types"
import { radialLayout } from "@/lib/mindmap/radialLayout"
import { treeToFlow, type MindMapNodeData } from "@/lib/mindmap/treeToFlow"
import { toggleNodeCollapse, setNodeMastery, findNode } from "@/lib/mindmap/treeOps"
import { ROOT_COLOR, CATEGORY_COLORS } from "@/lib/mindmap/design"
import MindMapNode from "./MindMapNode"
import MasteryToolbar from "./MasteryToolbar"

const nodeTypes = { mindmap: MindMapNode }

const defaultEdgeOptions = {
  type: "straight",
  style: { stroke: "rgba(255,255,255,0.16)", strokeWidth: 1.5 },
}

// Initial framing. Lower padding = tree fills more of the viewport on first
// render; maxZoom lets small trees zoom in instead of floating tiny in the middle.
const FIT_VIEW_OPTIONS = { padding: 0.12, minZoom: 0.2, maxZoom: 1.5 }

const LEGEND: { label: string; color: string; dashed?: boolean }[] = [
  { label: "Główny", color: ROOT_COLOR },
  { label: "Gałąź", color: CATEGORY_COLORS.anatomy },
  { label: "Liść", color: CATEGORY_COLORS.pathology },
  { label: "Zwinięty", color: CATEGORY_COLORS.treatment, dashed: true },
]

interface MindMapViewProps {
  root: TreeNode
  onRootChange: (next: TreeNode) => void
}

function Canvas({ root, onRootChange }: MindMapViewProps) {
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => {
    const positions = radialLayout(root)
    const graph = treeToFlow(root, positions)
    const nodes = graph.nodes.map((n) =>
      n.id === selectedLeafId ? { ...n, selected: true } : n
    ) as unknown as Node<MindMapNodeData>[]
    return { nodes, edges: graph.edges as unknown as Edge[] }
  }, [root, selectedLeafId])

  // Fit only on initial mount (the `fitView` prop). Collapsing/expanding must NOT
  // reset the viewport — the user keeps their current zoom/pan; the Controls
  // "fit" button re-frames on demand.
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<MindMapNodeData>) => {
      // Branches (or collapsed nodes) toggle; a genuine leaf selects for mastery.
      const isBranch = !node.data.isLeaf || node.data.collapsed
      if (isBranch) {
        setSelectedLeafId(null)
        onRootChange(toggleNodeCollapse(root, node.id))
      } else {
        setSelectedLeafId(node.id)
      }
    },
    [root, onRootChange]
  )

  const onPaneClick = useCallback(() => setSelectedLeafId(null), [])

  const handleMastery = useCallback(
    (level: MasteryLevel) => {
      if (!selectedLeafId) return
      onRootChange(setNodeMastery(root, selectedLeafId, level))
    },
    [root, selectedLeafId, onRootChange]
  )

  const selectedMastery = selectedLeafId
    ? findNode(root, selectedLeafId)?.metadata?.masteryLevel
    : undefined

  return (
    <ReactFlow
      colorMode="dark"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={FIT_VIEW_OPTIONS}
      minZoom={0.2}
      maxZoom={2.5}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnPinch
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      proOptions={{ hideAttribution: false }}
      className="!bg-zinc-900"
    >
      {selectedLeafId && (
        <NodeToolbar nodeId={selectedLeafId} isVisible position={Position.Top} offset={14}>
          <MasteryToolbar current={selectedMastery} onSelect={handleMastery} />
        </NodeToolbar>
      )}

      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#3f3f46" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => (n.data as MindMapNodeData).color}
        maskColor="rgba(0,0,0,0.6)"
        className="!bg-zinc-800"
      />
      <Panel position="top-left">
        <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 backdrop-blur-sm">
          {LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px] text-zinc-300">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  background: item.color,
                  outline: item.dashed ? `1.5px dashed ${item.color}` : undefined,
                  outlineOffset: item.dashed ? 1 : undefined,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </Panel>
    </ReactFlow>
  )
}

export default function MindMapView(props: MindMapViewProps) {
  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <Canvas {...props} />
      </ReactFlowProvider>
    </div>
  )
}
