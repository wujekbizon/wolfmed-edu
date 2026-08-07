'use client'

import { useCallback, useRef, useState, type RefObject } from 'react'
import { sceneCoordsToViewportCoords } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'
import { getCommonGroupId, getSelectionBounds, isSameSelection } from '@/lib/diagram/selectionGeometry'
import { getToolbarPlacement, type ToolbarPlacement } from '@/lib/diagram/toolbarPlacement'
import { TOOLBAR_FALLBACK_SIZE, TOOLBAR_GAP } from '@/constants/diagramCanvas'
import type { DiagramSelection } from '@/types/diagramTypes'

interface AppStateLike {
  selectedElementIds?: Record<string, boolean>
  scrollX: number
  scrollY: number
  zoom: { value: number }
  offsetLeft: number
  offsetTop: number
  width: number
  height: number
}

/**
 * Tracks what the student has selected and keeps its toolbar glued to it.
 *
 * A subgraph is a real Excalidraw group, so clicking a node inside one selects
 * the whole subgraph — ten elements, not one. The selection is classified
 * rather than rejected: a lone element is a node, a shared group is a group.
 *
 * Only the identity lives in React state. The anchor changes on every frame of
 * a camera animation, and onChange fires on host re-renders as well as scene
 * changes, so putting the position in state produced setState -> render ->
 * onChange -> setState until React threw "maximum update depth exceeded". The
 * position is written straight to the toolbar node instead.
 */
export function useDiagramSelection(toolbarRef: RefObject<HTMLDivElement | null>) {
  const [selection, setSelection] = useState<DiagramSelection | null>(null)
  const anchorRef = useRef<ToolbarPlacement>({ x: 0, y: 0, placement: 'above' })

  const sync = useCallback(
    (elements: readonly ExcalidrawElement[], appState: AppStateLike) => {
      const ids = appState.selectedElementIds ?? {}
      const selected = elements.filter((element) => ids[element.id])
      const named = selected.filter((element) => element.customData?.nodeId)

      if (named.length === 0) {
        setSelection((current) => (current === null ? current : null))
        return
      }

      const container = named.find((element) => element.customData?.role === DIAGRAM_GROUP_ROLE)
      const single = named.length === 1 ? named[0] : undefined
      const representative = single ?? container ?? named[0]
      if (!representative) return

      const bounds = getSelectionBounds(selected)
      if (!bounds) return

      // sceneCoordsToViewportCoords includes the canvas offset; the toolbar
      // sits inside that same box, so it has to come back off.
      const topLeft = sceneCoordsToViewportCoords(
        { sceneX: bounds.minX, sceneY: bounds.minY },
        appState as never
      )
      const bottomRight = sceneCoordsToViewportCoords(
        { sceneX: bounds.maxX, sceneY: bounds.maxY },
        appState as never
      )
      const canvas = { width: appState.width, height: appState.height }

      const toolbar = toolbarRef.current
      const size = toolbar?.offsetWidth
        ? { width: toolbar.offsetWidth, height: toolbar.offsetHeight }
        : TOOLBAR_FALLBACK_SIZE

      anchorRef.current = getToolbarPlacement(
        {
          left: topLeft.x - appState.offsetLeft,
          top: topLeft.y - appState.offsetTop,
          right: bottomRight.x - appState.offsetLeft,
          bottom: bottomRight.y - appState.offsetTop,
        },
        canvas,
        size
      )
      applyAnchor(toolbar, anchorRef.current)

      const next: DiagramSelection = {
        kind: single && !container ? 'node' : 'group',
        elementId: representative.id,
        label: String(representative.customData?.nodeId ?? ''),
        groupId: getCommonGroupId(selected),
      }

      setSelection((current) => (isSameSelection(current, next) ? current : next))
    },
    [toolbarRef]
  )

  return { selection, anchorRef, sync }
}

/**
 * Position is written to the element rather than rendered, so the transform
 * that flips the toolbar above or below its selection goes with it.
 */
export function applyAnchor(element: HTMLElement | null, placement: ToolbarPlacement): void {
  if (!element) return

  const isAbove = placement.placement === 'above'
  element.style.left = `${placement.x}px`
  element.style.top = `${placement.y + (isAbove ? -TOOLBAR_GAP : TOOLBAR_GAP)}px`
  element.style.transform = isAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)'
}
