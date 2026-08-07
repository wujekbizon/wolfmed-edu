import { useCallback, useEffect, useRef, useState } from 'react'

// A scene counts as active once most of it is on screen. The 0.55 ratio is
// deliberately above half: with each scene a full viewport tall, only one can
// clear it at a time, so the reveals never fight.
const ACTIVE_RATIO = 0.55

export function useSceneReveal(count: number) {
  const [active, setActive] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, index) => index === 0)
  )
  const scenes = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setActive((current) => {
          const next = [...current]
          for (const entry of entries) {
            const index = scenes.current.indexOf(entry.target as HTMLElement)
            if (index !== -1) next[index] = entry.intersectionRatio > ACTIVE_RATIO
          }
          return next
        })
      },
      { threshold: [0, ACTIVE_RATIO, 1] }
    )

    for (const scene of scenes.current) {
      if (scene) observer.observe(scene)
    }

    return () => observer.disconnect()
  }, [count])

  const setScene = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      scenes.current[index] = node
    },
    []
  )

  return { active, setScene }
}
