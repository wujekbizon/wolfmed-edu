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
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react"
import type { MindMapNode as TreeNode } from "@/lib/mindmap/types"
import { radialLayout } from "@/lib/mindmap/radialLayout"
import { treeToFlow, type MindMapNodeData } from "@/lib/mindmap/treeToFlow"
import { toggleNodeCollapse } from "@/lib/mindmap/treeOps"
import MindMapNode from "./MindMapNode"

const nodeTypes = { mindmap: MindMapNode }

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
    fitView({ duration: 300, padding: 0.2 })
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
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.2}
      maxZoom={2}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable
      panOnScroll
      zoomOnPinch
      onNodeClick={onNodeClick}
      proOptions={{ hideAttribution: false }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-zinc-50" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => (n.data as MindMapNodeData).color}
        className="!bg-white"
      />
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
