"use client"

import "@xyflow/react/dist/style.css"
import { useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react"
import type { MindMapNode as TreeNode } from "@/lib/mindmap/types"
import { radialLayout } from "@/lib/mindmap/radialLayout"
import { treeToFlow, type MindMapNodeData } from "@/lib/mindmap/treeToFlow"
import { toggleNodeCollapse } from "@/lib/mindmap/treeOps"
import { ROOT_COLOR, CATEGORY_COLORS } from "@/lib/mindmap/design"
import MindMapNode from "./MindMapNode"

const nodeTypes = { mindmap: MindMapNode }

const defaultEdgeOptions = {
  type: "straight",
  style: { stroke: "rgba(255,255,255,0.16)", strokeWidth: 1.5 },
}

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
  const { nodes, edges } = useMemo(() => {
    const positions = radialLayout(root)
    const graph = treeToFlow(root, positions)
    return {
      nodes: graph.nodes as unknown as Node<MindMapNodeData>[],
      edges: graph.edges as unknown as Edge[],
    }
  }, [root])

  const { fitView } = useReactFlow()
  useEffect(() => {
    fitView({ duration: 300, padding: 0.25 })
  }, [nodes.length, fitView])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<MindMapNodeData>) => {
      // A genuine leaf (not collapsed, no children) has nothing to toggle.
      if (node.data.isLeaf && !node.data.collapsed) return
      onRootChange(toggleNodeCollapse(root, node.id))
    },
    [root, onRootChange]
  )

  return (
    <ReactFlow
      colorMode="dark"
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView
      fitViewOptions={{ padding: 0.25 }}
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnPinch
      onNodeClick={onNodeClick}
      proOptions={{ hideAttribution: false }}
      className="!bg-zinc-900"
    >
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
