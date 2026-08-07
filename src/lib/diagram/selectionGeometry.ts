import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { TOOLBAR_GAP, TOOLBAR_MARGIN } from '@/constants/diagramCanvas'
import type { DiagramAnchor, DiagramSelection } from '@/types/diagramTypes'

interface Size {
  width: number
  height: number
}

/**
 * Keeps the toolbar inside the cell.
 *
 * The anchor follows the selection, which is often partly or wholly outside
 * the visible canvas — a group whose top edge is above the viewport gives a
 * negative y, and the toolbar was drawn over the page above the cell.
 *
 * The element is drawn centred above the anchor, so the limits are expressed
 * in terms of where that puts its box.
 */
export function clampAnchor(anchor: DiagramAnchor, toolbar: Size, canvas: Size): DiagramAnchor {
  const halfWidth = toolbar.width / 2
  const minX = TOOLBAR_MARGIN + halfWidth
  const maxX = Math.max(minX, canvas.width - TOOLBAR_MARGIN - halfWidth)
  const minY = TOOLBAR_MARGIN + toolbar.height + TOOLBAR_GAP
  const maxY = Math.max(minY, canvas.height - TOOLBAR_MARGIN)

  return {
    x: Math.min(Math.max(anchor.x, minX), maxX),
    y: Math.min(Math.max(anchor.y, minY), maxY),
  }
}

type Elements = readonly ExcalidrawElement[]

/**
 * Guards the selection state against re-render loops.
 *
 * onChange fires when the host re-renders as well as when the scene changes,
 * so storing a freshly built object every time meant setState -> render ->
 * onChange -> setState, which React kills with "maximum update depth
 * exceeded". Position is excluded on purpose: it changes on every frame of a
 * camera animation and is applied to the toolbar directly.
 */
export function isSameSelection(a: DiagramSelection | null, b: DiagramSelection | null): boolean {
  if (a === b) return true
  if (!a || !b) return false

  return a.kind === b.kind && a.elementId === b.elementId && a.groupId === b.groupId
}

/**
 * The group every selected element belongs to, innermost first.
 *
 * Nested subgraphs give a member several group ids ordered inside-out, so the
 * first shared one is the tightest group that covers the whole selection.
 */
export function getCommonGroupId(selected: Elements): string | null {
  const first = selected[0]
  if (!first?.groupIds?.length) return null

  return (
    first.groupIds.find((groupId) =>
      selected.every((element) => element.groupIds?.includes(groupId))
    ) ?? null
  )
}

/** Top-centre of the selection's bounding box, in scene coordinates. */
export function getSelectionAnchor(selected: Elements): { x: number; y: number } {
  if (selected.length === 0) return { x: 0, y: 0 }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity

  for (const element of selected) {
    minX = Math.min(minX, element.x)
    minY = Math.min(minY, element.y)
    maxX = Math.max(maxX, element.x + element.width)
  }

  return { x: (minX + maxX) / 2, y: minY }
}
