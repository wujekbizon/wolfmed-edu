'use client'

import { useCallback, useState } from 'react'
import { sceneCoordsToViewportCoords } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'
import { getCommonGroupId, getSelectionAnchor, isSameSelection } from '@/lib/diagram/selectionGeometry'
import type { DiagramSelection } from '@/types/diagramTypes'

interface AppStateLike {
  selectedElementIds?: Record<string, boolean>
  scrollX: number
  scrollY: number
  zoom: { value: number }
  offsetLeft: number
  offsetTop: number
}

/**
 * Tracks what the student has selected and where to anchor its toolbar.
 *
 * A subgraph is a real Excalidraw group, so clicking any node inside one
 * selects the whole subgraph — ten elements, not one. That is the editing
 * behaviour we want to keep, so the selection is classified rather than
 * rejected: one element is a node, a shared group is a group.
 *
 * Reads from the onChange app state rather than polling, and recomputes the
 * anchor on the same callback so the toolbar stays glued while panning.
 */
export function useDiagramSelection() {
  const [selection, setSelection] = useState<DiagramSelection | null>(null)

  const sync = useCallback((elements: readonly ExcalidrawElement[], appState: AppStateLike) => {
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

    const next: DiagramSelection = {
      kind: single && !container ? 'node' : 'group',
      elementId: representative.id,
      label: String(representative.customData?.nodeId ?? ''),
      groupId: getCommonGroupId(selected),
      // sceneCoordsToViewportCoords includes the canvas offset; the toolbar
      // sits inside that same box, so it has to come back off.
      anchor: { x: x - appState.offsetLeft, y: y - appState.offsetTop },
    }

    setSelection((current) => (isSameSelection(current, next) ? current : next))
  }, [])

  const clear = useCallback(() => setSelection(null), [])

  return { selection, sync, clear }
}
