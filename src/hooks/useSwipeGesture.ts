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
 * Attaches swipe gesture handling via the Pointer Events API.
 * Only active on touch screens — uses (pointer: coarse) to detect them.
 *
 * - Swipe right from left edge → open
 * - Swipe left anywhere when drawer is open → close
 */
export function useSwipeGesture({
  isOpen,
  onOpen,
  onClose,
  edgeZone = 24,
  swipeThreshold = 56,
}: UseSwipeGestureOptions) {
  const isTouch = useMediaQuery('(pointer: coarse)')
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  useEffect(() => {
    if (!isTouch) return

    const onPointerDown = (e: PointerEvent) => {
      startX.current = e.clientX
      startY.current = e.clientY
    }

    const onPointerUp = (e: PointerEvent) => {
      if (startX.current === null || startY.current === null) return

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
  }, [isTouch, isOpen, onOpen, onClose, edgeZone, swipeThreshold])
}
