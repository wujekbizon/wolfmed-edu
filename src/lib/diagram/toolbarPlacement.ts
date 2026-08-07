import {
  TOOLBAR_GAP,
  TOOLBAR_MARGIN,
  TOOLBAR_SAFE_BOTTOM,
  TOOLBAR_SAFE_TOP,
} from '@/constants/diagramCanvas'
import type { DiagramAnchor } from '@/types/diagramTypes'

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

interface Size {
  width: number
  height: number
}

export interface ToolbarPlacement extends DiagramAnchor {
  placement: 'above' | 'below'
}

/**
 * Where to put the selection toolbar so it belongs to the selection and stays
 * clear of Excalidraw's own chrome.
 *
 * Anchoring to the true top of a group taller than the viewport pushed the
 * toolbar off the cell; clamping it to the canvas edge then parked it under
 * Excalidraw's tool island, which owns the top of the canvas — and its mobile
 * bottom bar owns the other end. So the toolbar sits above the visible top of
 * the selection when there is room, and flips below it when there is not.
 */
export function getToolbarPlacement(bounds: Box, canvas: Size, toolbar: Size): ToolbarPlacement {
  const visibleLeft = Math.max(bounds.left, 0)
  const visibleRight = Math.min(bounds.right, canvas.width)
  // Fully off to one side: keep the untrimmed centre so the toolbar still
  // points the right way instead of snapping to an edge.
  const centreX =
    visibleRight > visibleLeft
      ? (visibleLeft + visibleRight) / 2
      : (bounds.left + bounds.right) / 2

  const halfWidth = toolbar.width / 2
  const minX = TOOLBAR_MARGIN + halfWidth
  const x = Math.min(Math.max(centreX, minX), Math.max(minX, canvas.width - TOOLBAR_MARGIN - halfWidth))

  const safeTop = TOOLBAR_SAFE_TOP + toolbar.height + TOOLBAR_GAP
  const safeBottom = canvas.height - TOOLBAR_SAFE_BOTTOM

  if (bounds.top >= safeTop) return { x, y: bounds.top, placement: 'above' }

  const below = Math.min(Math.max(bounds.bottom, TOOLBAR_SAFE_TOP), safeBottom - toolbar.height)
  return { x, y: Math.max(below, TOOLBAR_SAFE_TOP), placement: 'below' }
}
