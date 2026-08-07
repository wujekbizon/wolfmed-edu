import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

// How far from the frame's centre a scene keeps some presence, as a fraction of
// the frame height. Above 0.5 neighbouring scenes overlap, so the outgoing text
// is still faintly readable while the next one comes up.
const FALLOFF = 0.85

// Continuous focus per scene, from its distance to the centre of the scroll
// frame. An IntersectionObserver would only report crossings, which is what
// made the previous version snap between two opacity values; this tracks the
// scroll itself, so the fade follows the finger.
export function useSceneFocus(count: number, root: RefObject<HTMLElement | null>) {
  const scenes = useRef<(HTMLElement | null)[]>([])
  const [focus, setFocus] = useState<number[]>(() => Array.from({ length: count }, (_, i) => (i === 0 ? 1 : 0)))

  useEffect(() => {
    const frame = root.current
    if (!frame) return

    // Inline styles outrank any motion-reduce class, so the opt-out has to
    // happen here: every scene stays fully present and nothing fades.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFocus(Array.from({ length: count }, () => 1))
      return
    }

    let raf = 0

    const measure = () => {
      const bounds = frame.getBoundingClientRect()
      const centre = bounds.top + bounds.height / 2
      const reach = bounds.height * FALLOFF

      setFocus(
        scenes.current.map((scene) => {
          if (!scene) return 0
          const rect = scene.getBoundingClientRect()
          const distance = Math.abs(rect.top + rect.height / 2 - centre)
          return Math.max(0, 1 - distance / reach)
        })
      )
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    measure()
    frame.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(raf)
      frame.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [count, root])

  const setScene = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      scenes.current[index] = node
    },
    []
  )

  return { focus, setScene }
}
