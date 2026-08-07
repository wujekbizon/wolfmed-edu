'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'
import { RESIZE_DEBOUNCE_MS } from '@/constants/diagramCanvas'

const RAIL_SELECTOR = '.mobile-misc-tools-container'
const RAIL_GAP = 8

export interface CanvasChrome {
  /** True once Excalidraw has folded its controls into the vertical side rail. */
  isCompact: boolean
  top: number
  right: number
}

const DESKTOP: CanvasChrome = { isCompact: false, top: 0, right: 0 }

/**
 * Where Excalidraw has put its own controls.
 *
 * Below a certain size it moves the Library trigger out of the top row into a
 * vertical rail on the right, and anything passed to renderTopRightUI is left
 * behind in the toolbar row — so our controls have to follow it down.
 *
 * The rail is measured rather than predicted: it only exists in the compact
 * layout, so its presence is the signal, and reading its box keeps us aligned
 * with it without copying Excalidraw's breakpoints.
 */
export function useCanvasChrome(
  wrapperRef: RefObject<HTMLDivElement | null>,
  isReady: boolean
): CanvasChrome {
  const [chrome, setChrome] = useState<CanvasChrome>(DESKTOP)

  const measure = useCallback(() => {
    const wrapper = wrapperRef.current
    const rail = wrapper?.querySelector(RAIL_SELECTOR)

    if (!wrapper || !rail) {
      setChrome((current) => (current.isCompact ? DESKTOP : current))
      return
    }

    const railBox = rail.getBoundingClientRect()
    const wrapperBox = wrapper.getBoundingClientRect()
    const next: CanvasChrome = {
      isCompact: true,
      top: Math.round(railBox.bottom - wrapperBox.top + RAIL_GAP),
      right: Math.round(wrapperBox.right - railBox.right),
    }

    setChrome((current) =>
      current.isCompact === next.isCompact && current.top === next.top && current.right === next.right
        ? current
        : next
    )
  }, [wrapperRef])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || !isReady) return

    measure()

    let timer: ReturnType<typeof setTimeout> | null = null
    const observer = new ResizeObserver(() => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(measure, RESIZE_DEBOUNCE_MS)
    })
    observer.observe(wrapper)

    return () => {
      observer.disconnect()
      if (timer) clearTimeout(timer)
    }
  }, [wrapperRef, isReady, measure])

  return chrome
}
