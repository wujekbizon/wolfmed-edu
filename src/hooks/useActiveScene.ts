import { RefObject, useEffect, useRef, useState } from 'react'

// Marks a scene active as it crosses the middle of the scroll frame. The
// observer's root is the frame itself, not the viewport — the scenes scroll
// inside it, so the page would never report them moving.
export function useActiveScene(count: number, root: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0)
  const scenes = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (!root.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = scenes.current.indexOf(entry.target as HTMLElement)
          if (index !== -1) setActive(index)
        }
      },
      { root: root.current, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )

    for (const scene of scenes.current) {
      if (scene) observer.observe(scene)
    }

    return () => observer.disconnect()
  }, [count, root])

  const setScene = (index: number) => (node: HTMLElement | null) => {
    scenes.current[index] = node
  }

  return { active, setScene }
}
