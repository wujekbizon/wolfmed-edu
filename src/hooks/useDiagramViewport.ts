'use client'

import { useEffect, type RefObject } from 'react'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import { RESIZE_DEBOUNCE_MS } from '@/constants/diagramCanvas'

/**
 * Keeps the diagram framed when the cell changes size.
 *
 * Excalidraw resizes its canvas but keeps scroll and zoom, so expanding a cell
 * to fullscreen just surrounded the same small diagram with empty space.
 *
 * One ResizeObserver covers all three ways the cell can change size: the
 * fullscreen toggle (which never calls re-resizable's onResizeStop), a manual
 * handle drag (which only reports at drag end) and a window resize.
 */
export function useDiagramViewport(
  wrapperRef: RefObject<HTMLDivElement | null>,
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  fitAuto: (animate?: boolean) => void
) {
  useEffect(() => {
    const element = wrapperRef.current
    if (!element || !excalidrawAPI) return

    let timer: ReturnType<typeof setTimeout> | null = null
    // The observer reports the initial size too; the scene fit already covers it.
    let isFirstObservation = true

    const observer = new ResizeObserver(() => {
      if (isFirstObservation) {
        isFirstObservation = false
        return
      }
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        // Offsets are stale after the container moves — scrollToContent and
        // pointer hit-testing both read them.
        excalidrawAPI.refresh()
        fitAuto()
      }, RESIZE_DEBOUNCE_MS)
    })

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [wrapperRef, excalidrawAPI, fitAuto])
}
