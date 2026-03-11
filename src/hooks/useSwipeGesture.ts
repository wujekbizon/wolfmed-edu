import { useEffect, useRef } from 'react'
import { useMediaQuery } from './useMediaQuery'

interface UseSwipeGestureOptions {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  /** px from left edge that counts as an edge swipe zone (default 24) */
  edgeZone?: number
  /** minimum horizontal px to register as a swipe (default 56) */
  swipeThreshold?: number
}

/**
 * Attaches horizontal swipe gesture handling to `document` via the
 * Pointer Events API. Only registers listeners below the `lg` breakpoint
 * (`max-width: 1023px`) — matching exactly when the NavDrawer is visible —
 * so desktop performance is completely unaffected.
 * Mouse pointer events are filtered out inside the handlers.
 *
 * Gesture rules:
 * - **Open**: swipe right, starting within `edgeZone` px of the left edge.
 * - **Close**: swipe left by at least `swipeThreshold` px while the drawer is open.
 * - Gestures that are more vertical than horizontal are ignored, preserving
 *   natural page scrolling.
 *
 * @param isOpen         - Current open state of the drawer.
 * @param onOpen         - Callback fired when an open swipe is detected.
 * @param onClose        - Callback fired when a close swipe is detected.
 * @param edgeZone       - Width of the left-edge trigger zone in px (default `24`).
 * @param swipeThreshold - Minimum horizontal distance in px to count as a swipe (default `56`).
 *
 * @example
 * useSwipeGesture({ isOpen, onOpen: toggleMenu, onClose: toggleMenu })
 */
export function useSwipeGesture({
  isOpen,
  onOpen,
  onClose,
  edgeZone = 24,
  swipeThreshold = 56,
}: UseSwipeGestureOptions) {
  const isMobile = useMediaQuery('(max-width: 1023px)')
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!isMobile) return

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      startX.current = e.clientX
      startY.current = e.clientY
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || startX.current === null || startY.current === null) return

      const originX = startX.current
      const dx = e.clientX - originX
      const dy = e.clientY - startY.current

      startX.current = null
      startY.current = null

      // Ignore if gesture is more vertical than horizontal
      if (Math.abs(dy) > Math.abs(dx)) return

      if (!isOpen && dx > swipeThreshold && originX < edgeZone) {
        onOpen()
      } else if (isOpen && dx < -swipeThreshold) {
        onClose()
      }
    }

    document.addEventListener('pointerdown', onPointerDown, { passive: true })
    document.addEventListener('pointerup', onPointerUp, { passive: true })

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }, [isMobile, isOpen, onOpen, onClose, edgeZone, swipeThreshold])
}
