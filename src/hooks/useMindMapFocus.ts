'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import type { MindMapNodeData } from '@/lib/mindmap/treeToFlow'
import type { FocusRequest } from '@/types/mindmapFocusTypes'
import { FIT_VIEW_OPTIONS } from '@/constants/mindmapCanvas'

const FOCUS_DURATION = 500
const LEAF_ZOOM = 1.15
// The NodeDetailCard covers the right edge on desktop (w-80) and the bottom on
// mobile, so the focus point shifts toward the card to keep the node clear of it.
const DETAIL_CARD_OFFSET_X = 150
const DETAIL_CARD_OFFSET_Y = 90

/**
 * Animated camera focus for the mind map. Interactions queue a FocusRequest;
 * it is applied in an effect after the rebuilt nodes land in React Flow, since
 * expand/collapse changes positions only once the new layout is committed.
 */
export function useMindMapFocus(nodes: Node<MindMapNodeData>[]) {
  const { fitView, setCenter, getNode, getEdges, getZoom } = useReactFlow()
  const pendingRef = useRef<FocusRequest | null>(null)

  const applyFocus = useCallback(
    (request: FocusRequest) => {
      if (request.kind === 'reset') {
        fitView({ duration: FOCUS_DURATION, ...FIT_VIEW_OPTIONS })
        return
      }

      const node = getNode(request.nodeId)
      if (!node) return

      if (request.kind === 'leaf') {
        const halfWidth = (node.measured?.width ?? node.width ?? 0) / 2
        const halfHeight = (node.measured?.height ?? node.height ?? 0) / 2
        const isDesktop = window.matchMedia('(min-width: 768px)').matches
        const x = node.position.x + halfWidth + (isDesktop ? DETAIL_CARD_OFFSET_X : 0)
        const y = node.position.y + halfHeight + (isDesktop ? 0 : DETAIL_CARD_OFFSET_Y)
        setCenter(x, y, { zoom: Math.max(getZoom(), LEAF_ZOOM), duration: FOCUS_DURATION })
        return
      }

      // Expanding dives into the clicked node plus its newly revealed children;
      // collapsing pulls back to just the clicked node.
      const children =
        request.kind === 'expand'
          ? getEdges().filter((e) => e.source === request.nodeId).map((e) => ({ id: e.target }))
          : []
      fitView({
        nodes: [{ id: request.nodeId }, ...children],
        duration: FOCUS_DURATION,
        padding: request.kind === 'expand' ? 0.3 : 0.6,
        maxZoom: 1.25,
      })
    },
    [fitView, setCenter, getNode, getEdges, getZoom]
  )

  useEffect(() => {
    if (!pendingRef.current) return
    const request = pendingRef.current
    pendingRef.current = null
    applyFocus(request)
  }, [nodes, applyFocus])

  return useCallback((request: FocusRequest) => {
    pendingRef.current = request
  }, [])
}
