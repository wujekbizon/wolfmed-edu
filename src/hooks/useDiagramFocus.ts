'use client'

import { useCallback } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { getGroupElements, getNeighbourhood } from '@/lib/diagram/relatedElements'
import type { DiagramSelection } from '@/types/diagramTypes'

/**
 * Turns a selection into a camera target.
 *
 * The selection already says what to zoom to, so one action covers both cases:
 * a node brings its connections with it, since a node alone fills the viewport
 * and explains nothing; a subgraph brings its members.
 *
 * The move goes through the camera owner rather than calling scrollToContent
 * directly — a resize landing mid-focus would otherwise fight it, and the
 * suppression token that keeps auto-fit alive lives there too.
 */
export function useDiagramFocus(
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  focus: (target: readonly ExcalidrawElement[]) => void
) {
  return useCallback(
    (selection: DiagramSelection) => {
      if (!excalidrawAPI) return
      const elements = excalidrawAPI.getSceneElements()

      if (selection.kind === 'node') {
        focus(getNeighbourhood(elements, selection.elementId))
        return
      }

      if (selection.groupId) focus(getGroupElements(elements, selection.groupId))
    },
    [excalidrawAPI, focus]
  )
}
