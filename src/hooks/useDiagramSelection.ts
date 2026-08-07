'use client'

import { useCallback, useRef, useState, type RefObject } from 'react'
import { sceneCoordsToViewportCoords } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'
import { clampAnchor, getCommonGroupId, getSelectionAnchor, isSameSelection } from '@/lib/diagram/selectionGeometry'
import { TOOLBAR_FALLBACK_SIZE, TOOLBAR_GAP } from '@/constants/diagramCanvas'
import type { DiagramAnchor, DiagramSelection } from '@/types/diagramTypes'

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
  const anchorRef = useRef<DiagramAnchor>({ x: 0, y: 0 })

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

      const bounds = getSelectionAnchor(selected)
      const { x, y } = sceneCoordsToViewportCoords(
        { sceneX: bounds.x, sceneY: bounds.y },
        appState as never
      )

      const toolbar = toolbarRef.current
      const size = toolbar?.offsetWidth
        ? { width: toolbar.offsetWidth, height: toolbar.offsetHeight }
        : TOOLBAR_FALLBACK_SIZE

      // sceneCoordsToViewportCoords includes the canvas offset; the toolbar
      // sits inside that same box, so it has to come back off.
      anchorRef.current = clampAnchor(
        { x: x - appState.offsetLeft, y: y - appState.offsetTop },
        size,
        { width: appState.width, height: appState.height }
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

export function applyAnchor(element: HTMLElement | null, anchor: DiagramAnchor): void {
  if (!element) return
  element.style.left = `${anchor.x}px`
  element.style.top = `${anchor.y - TOOLBAR_GAP}px`
}
