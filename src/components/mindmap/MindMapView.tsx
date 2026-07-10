"use client"

import "@xyflow/react/dist/style.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toPng } from "html-to-image"
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
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
  type Node,
  type Edge,
} from "@xyflow/react"
import type { MindMapNode as TreeNode, MasteryLevel } from "@/lib/mindmap/types"
import { radialLayout } from "@/lib/mindmap/radialLayout"
import { treeLayout } from "@/lib/mindmap/treeLayout"
import { treeToFlow, type MindMapNodeData } from "@/lib/mindmap/treeToFlow"
import { toggleNodeCollapse, setNodeMastery, findNode } from "@/lib/mindmap/treeOps"
import { ROOT_COLOR, CATEGORY_COLORS } from "@/lib/mindmap/design"
import MindMapNode from "./MindMapNode"
import MasteryToolbar from "./MasteryToolbar"

type LayoutMode = "radial" | "tree"
const CANVAS_BG = "#18181b"

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
  const [layout, setLayout] = useState<LayoutMode>("radial")
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()

  const { nodes, edges } = useMemo(() => {
    const positions = layout === "tree" ? treeLayout(root) : radialLayout(root)
    const graph = treeToFlow(root, positions)
    const nodes = graph.nodes.map((n) =>
      n.id === selectedLeafId ? { ...n, selected: true } : n
    ) as unknown as Node<MindMapNodeData>[]
    return { nodes, edges: graph.edges as unknown as Edge[] }
  }, [root, selectedLeafId, layout])

  // Reframe when the layout mode changes (an explicit action where reframing is
  // expected) — but not on collapse/expand.
  useEffect(() => {
    fitView({ duration: 300, ...FIT_VIEW_OPTIONS })
  }, [layout, fitView])

  const handleExport = useCallback(() => {
    const viewportEl = wrapperRef.current?.querySelector<HTMLElement>(".react-flow__viewport")
    if (!viewportEl || nodes.length === 0) return
    const width = 1200
    const height = 800
    const bounds = getNodesBounds(nodes)
    const vp = getViewportForBounds(bounds, width, height, 0.5, 2, 0.12)
    toPng(viewportEl, {
      backgroundColor: CANVAS_BG,
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
      },
    })
      .then((dataUrl) => {
        const link = document.createElement("a")
        link.download = "mapa-mysli.png"
        link.href = dataUrl
        link.click()
      })
      .catch(() => {})
  }, [nodes])

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
    <div ref={wrapperRef} className="h-full w-full">
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
      <Panel position="top-right">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/80 p-1 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setLayout("radial")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              layout === "radial" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            Promienisty
          </button>
          <button
            type="button"
            onClick={() => setLayout("tree")}
            className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              layout === "tree" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            Drzewo
          </button>
          <span className="mx-0.5 h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={handleExport}
            title="Pobierz PNG"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="M7 10l5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            PNG
          </button>
        </div>
      </Panel>
    </ReactFlow>
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
