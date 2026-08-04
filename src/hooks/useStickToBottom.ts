import { useEffect, type RefObject } from 'react'

// How close to the bottom still counts as "following along". Above this, the
// student has scrolled up to read and must not be yanked back down.
const PIN_THRESHOLD_PX = 80

/**
 * Keeps a scroll container pinned to its bottom while its content grows.
 *
 * Watches the content box rather than a dependency array, because the height
 * changes on things React cannot express as a dep: progress log lines arriving
 * over SSE, markdown finishing layout, an answer expanding as it renders.
 *
 * Unpins the moment the student scrolls up, and re-pins when they come back
 * down, so reading an earlier answer is never interrupted.
 */
export function useStickToBottom(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    let pinned = true

    const distanceFromBottom = () =>
      container.scrollHeight - container.scrollTop - container.clientHeight

    const handleScroll = () => {
      pinned = distanceFromBottom() <= PIN_THRESHOLD_PX
    }

    const stick = () => {
      if (pinned) container.scrollTop = container.scrollHeight
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    const observer = new ResizeObserver(stick)
    observer.observe(content)

    stick()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [containerRef, contentRef])
}
