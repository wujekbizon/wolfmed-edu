'use client'

import { useCallback, useState } from 'react'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'
import { getCommonGroupId, isSameSelection } from '@/lib/diagram/selectionGeometry'
import type { DiagramSelection } from '@/types/diagramTypes'

interface AppStateLike {
  selectedElementIds?: Record<string, boolean>
}

/**
 * Tracks what the student has selected.
 *
 * A subgraph is a real Excalidraw group, so clicking a node inside one selects
 * the whole subgraph — ten elements, not one. The selection is classified
 * rather than rejected: a lone element is a node, a shared group is a group.
 *
 * Only identity is stored. onChange fires on host re-renders as well as scene
 * changes, so anything derived from the viewport — a position, a size — turns
 * setState into setState -> render -> onChange -> setState, which React kills
 * with "maximum update depth exceeded".
 */
export function useDiagramSelection() {
  const [selection, setSelection] = useState<DiagramSelection | null>(null)

  const sync = useCallback((elements: readonly ExcalidrawElement[], appState: AppStateLike) => {
    const ids = appState.selectedElementIds ?? {}
    const named = elements.filter((element) => ids[element.id] && element.customData?.nodeId)

    if (named.length === 0) {
      setSelection((current) => (current === null ? current : null))
      return
    }

    const container = named.find((element) => element.customData?.role === DIAGRAM_GROUP_ROLE)
    const single = named.length === 1 ? named[0] : undefined
    const representative = single ?? container ?? named[0]
    if (!representative) return

    const next: DiagramSelection = {
      kind: single && !container ? 'node' : 'group',
      elementId: representative.id,
      label: String(representative.customData?.nodeId ?? ''),
      groupId: getCommonGroupId(named),
    }

    setSelection((current) => (isSameSelection(current, next) ? current : next))
  }, [])

  return { selection, sync }
}
