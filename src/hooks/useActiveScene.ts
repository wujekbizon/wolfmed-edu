import { useEffect, useRef, useState } from 'react'

// Marks a scene active as its trigger crosses the vertical middle of the
// viewport: the -50%/-50% root margin collapses the observer's root to a
// centre line, so exactly one trigger intersects at a time.
export function useActiveScene(count: number) {
  const [active, setActive] = useState(0)
  const triggers = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = triggers.current.indexOf(entry.target as HTMLElement)
          if (index !== -1) setActive(index)
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    )

    for (const trigger of triggers.current) {
      if (trigger) observer.observe(trigger)
    }

    return () => observer.disconnect()
  }, [count])

  const setTrigger = (index: number) => (node: HTMLElement | null) => {
    triggers.current[index] = node
  }

  return { active, setTrigger }
}
