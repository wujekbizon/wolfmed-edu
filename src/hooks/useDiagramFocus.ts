'use client'

import { useCallback } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { getGroupElements, getNeighbourhood } from '@/lib/diagram/relatedElements'
import type { DiagramSelection } from '@/types/diagramTypes'

/**
 * Turns a selection into a camera target.
 *
 * Both moves go through the camera owner rather than calling scrollToContent
 * directly — a resize landing mid-focus would otherwise fight it, and the
 * suppression token that keeps auto-fit alive lives there too.
 */
export function useDiagramFocus(
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  focus: (target: readonly ExcalidrawElement[]) => void
) {
  const focusNode = useCallback(
    (selection: DiagramSelection) => {
      if (!excalidrawAPI || selection.kind !== 'node') return
      focus(getNeighbourhood(excalidrawAPI.getSceneElements(), selection.elementId))
    },
    [excalidrawAPI, focus]
  )

  const focusGroup = useCallback(
    (selection: DiagramSelection) => {
      if (!excalidrawAPI) return

      // A container carries its own group id, so a node selection and a group
      // selection resolve the same way.
      if (!selection.groupId) return

      focus(getGroupElements(excalidrawAPI.getSceneElements(), selection.groupId))
    },
    [excalidrawAPI, focus]
  )

  return { focusNode, focusGroup }
}
