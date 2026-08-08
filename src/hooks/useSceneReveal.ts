import { useCallback, useEffect, useRef, useState } from 'react'

// Where the scene sits, not how much of it shows: a stacked card is a fraction
// of the viewport tall and could never clear a visible-ratio threshold the way
// a 90vh one does, so one rule serves both layouts.
const REVEAL_LINE = '0px 0px -25% 0px'

export function useSceneReveal(count: number) {
  const [active, setActive] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, index) => index === 0)
  )
  const observer = useRef<IntersectionObserver | null>(null)
  const pending = useRef(new Set<HTMLElement>())

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        setActive((current) => {
          const next = [...current]
          let changed = false

          for (const entry of entries) {
            // The index rides on the element. Looking it up in a ref array
            // instead means a lookup can miss while React is re-attaching
            // refs, and that scene silently stops updating.
            const index = Number((entry.target as HTMLElement).dataset.sceneIndex)
            if (!Number.isInteger(index)) continue

            const isActive = entry.isIntersecting
            if (next[index] !== isActive) {
              next[index] = isActive
              changed = true
            }
          }

          return changed ? next : current
        })
      },
      { rootMargin: REVEAL_LINE }
    )

    observer.current = io
    // Anything mounted before this effect ran is waiting here: refs attach
    // first, so on the initial render every scene lands in `pending`.
    for (const node of pending.current) io.observe(node)

    return () => {
      io.disconnect()
      observer.current = null
    }
  }, [])

  // Returning a cleanup ties observe/unobserve to the node's own lifetime, so
  // re-renders cannot leave a scene unobserved.
  const setScene = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (!node) return

      node.dataset.sceneIndex = String(index)
      pending.current.add(node)
      observer.current?.observe(node)

      return () => {
        pending.current.delete(node)
        observer.current?.unobserve(node)
      }
    },
    []
  )

  return { active, setScene }
}
