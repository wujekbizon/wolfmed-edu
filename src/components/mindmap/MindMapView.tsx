"use client"

import "@xyflow/react/dist/style.css"
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
} from "@xyflow/react"
import type { MindMapNode as TreeNode } from "@/types/mindmapTypes"
import type { MindMapNodeData } from "@/lib/mindmap/treeToFlow"
import { useMindMapCanvas } from "@/hooks/useMindMapCanvas"
import { FIT_VIEW_OPTIONS } from "@/constants/mindmapCanvas"
import MindMapNode from "./MindMapNode"
import MasteryToolbar from "./MasteryToolbar"
import NodeDetailCard from "./NodeDetailCard"
import MindMapLegend from "./MindMapLegend"
import MindMapControls from "./MindMapControls"

const nodeTypes = { mindmap: MindMapNode }

interface MindMapViewProps {
  root: TreeNode
  onRootChange: (next: TreeNode) => void
  onExplain: (nodeId: string) => void
}

function Canvas(props: MindMapViewProps) {
  const map = useMindMapCanvas(props)

  return (
    <div ref={map.wrapperRef} className="relative h-full w-full">
      <ReactFlow
        colorMode="dark"
        nodes={map.nodes}
        edges={map.edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={FIT_VIEW_OPTIONS}
        minZoom={0.2}
        maxZoom={2.5}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
        panOnScroll
        zoomOnPinch
        onNodeClick={map.onNodeClick}
        onPaneClick={map.clearSelection}
        proOptions={{ hideAttribution: false }}
        className="bg-zinc-900!"
      >
        {map.selectedId && !map.selectedIsLeaf && (
          <NodeToolbar nodeId={map.selectedId} isVisible position={Position.Top} offset={14}>
            <MasteryToolbar current={undefined} showMastery={false} onSelect={map.handleMastery} onExplain={map.handleExplain} />
          </NodeToolbar>
        )}

        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#3f3f46" />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => (n.data as MindMapNodeData).color}
          maskColor="rgba(0,0,0,0.6)"
          className="hidden! bg-zinc-800! md:block!"
        />
        <Panel
          position="top-left"
          className="top-auto! bottom-8! left-auto! right-2! md:top-0! md:bottom-auto! md:left-0! md:right-auto!"
        >
          <MindMapLegend />
        </Panel>
        <Panel position="top-right">
          <MindMapControls
            layout={map.layout}
            onLayoutChange={map.setLayout}
            onExport={map.handleExport}
            onExpandAll={map.handleExpandAll}
            onCollapseAll={map.handleCollapseAll}
            onResetView={map.handleResetView}
          />
        </Panel>
      </ReactFlow>

      {map.selectedNode && (map.selectedIsLeaf || map.selectedNode.metadata?.explanation) && (
        <NodeDetailCard
          node={map.selectedNode}
          path={map.selectedPath}
          onClose={map.clearSelection}
          onSetMastery={map.handleMastery}
          onExplain={map.handleExplain}
        />
      )}
    </div>
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
