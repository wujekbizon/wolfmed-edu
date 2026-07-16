'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import type { MindMapNode as TreeNode, MasteryLevel } from '@/types/mindmapTypes'
import { buildFlowGraph, type LayoutMode } from '@/lib/mindmap/buildFlowGraph'
import { exportMindMapPng } from '@/lib/mindmap/exportPng'
import type { MindMapNodeData } from '@/lib/mindmap/treeToFlow'
import { toggleNodeCollapse, setNodeMastery, findNode, getNodePath, expandAll, collapseBelowDepth } from '@/lib/mindmap/treeOps'
import { useMindMapFocus } from '@/hooks/useMindMapFocus'
import { FIT_VIEW_OPTIONS } from '@/constants/mindmapCanvas'

export function useMindMapCanvas({
  root,
  onRootChange,
  onExplain,
}: {
  root: TreeNode
  onRootChange: (next: TreeNode) => void
  onExplain: (nodeId: string) => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [layout, setLayout] = useState<LayoutMode>('radial')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { fitView } = useReactFlow()

  const { nodes, edges } = useMemo(
    () => buildFlowGraph(root, layout, selectedId),
    [root, selectedId, layout]
  )

  const requestFocus = useMindMapFocus(nodes)

  // Reframe when the layout mode changes (an explicit action) — but not on
  // collapse/expand, which gets its own focused camera move.
  useEffect(() => {
    fitView({ duration: 300, ...FIT_VIEW_OPTIONS })
  }, [layout, fitView])

  const handleExport = useCallback(() => {
    const viewportEl = wrapperRef.current?.querySelector<HTMLElement>('.react-flow__viewport')
    exportMindMapPng(viewportEl, nodes)
  }, [nodes])

  // Every node selects (opens the toolbar); branches and collapsed nodes
  // additionally toggle their subtree. Each click queues a matching camera move.
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<MindMapNodeData>) => {
      setSelectedId(node.id)
      const isBranch = !node.data.isLeaf || node.data.collapsed
      if (isBranch) {
        onRootChange(toggleNodeCollapse(root, node.id))
        requestFocus({ nodeId: node.id, kind: node.data.collapsed ? 'expand' : 'collapse' })
      } else {
        requestFocus({ nodeId: node.id, kind: 'leaf' })
      }
    },
    [root, onRootChange, requestFocus]
  )

  const clearSelection = useCallback(() => setSelectedId(null), [])

  const handleExpandAll = useCallback(() => {
    onRootChange(expandAll(root))
    requestFocus({ nodeId: root.id, kind: 'reset' })
  }, [root, onRootChange, requestFocus])

  const handleCollapseAll = useCallback(() => {
    onRootChange(collapseBelowDepth(root, 1))
    requestFocus({ nodeId: root.id, kind: 'reset' })
  }, [root, onRootChange, requestFocus])

  const handleResetView = useCallback(() => {
    fitView({ duration: 500, ...FIT_VIEW_OPTIONS })
  }, [fitView])

  const handleMastery = useCallback(
    (level: MasteryLevel) => {
      if (!selectedId) return
      onRootChange(setNodeMastery(root, selectedId, level))
    },
    [root, selectedId, onRootChange]
  )

  const handleExplain = useCallback(() => {
    if (!selectedId) return
    onExplain(selectedId)
    setSelectedId(null)
  }, [selectedId, onExplain])

  const selectedNode = selectedId ? findNode(root, selectedId) : null
  const selectedIsLeaf = Boolean(selectedNode && selectedNode.children.length === 0)
  const selectedPath = selectedId ? getNodePath(root, selectedId) ?? [] : []

  return {
    wrapperRef, nodes, edges, layout, setLayout,
    selectedId, selectedNode, selectedIsLeaf, selectedPath,
    onNodeClick, clearSelection, handleMastery, handleExplain, handleExport,
    handleExpandAll, handleCollapseAll, handleResetView,
  }
}
