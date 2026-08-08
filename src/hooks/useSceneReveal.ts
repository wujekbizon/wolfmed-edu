import { useCallback, useEffect, useRef, useState } from 'react'

// A scene counts as active once most of it is on screen. The 0.55 ratio is
// deliberately above half: with each scene a full viewport tall, only one can
// clear it at a time, so the reveals never fight.
const ACTIVE_RATIO = 0.55

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

            const isActive = entry.intersectionRatio > ACTIVE_RATIO
            if (next[index] !== isActive) {
              next[index] = isActive
              changed = true
            }
          }

          return changed ? next : current
        })
      },
      { threshold: [0, ACTIVE_RATIO, 1] }
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
