import { useCallback, useEffect, useRef, useState } from 'react'

// The track is moved by writing to its style directly rather than through
// state: this runs on every scroll frame, and re-rendering the cards at 60fps
// to change one transform is the difference between smooth and not.
export function useHorizontalPath(count: number) {
  const section = useRef<HTMLElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  const [percent, setPercent] = useState(0)
  const [near, setNear] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, index) => index === 0)
  )

  const update = useCallback(() => {
    const stage = section.current
    const rail = track.current
    const frame = viewport.current
    if (!stage || !rail || !frame) return

    // Below the breakpoint the steps are a plain vertical list, so any leftover
    // transform would push them off screen.
    if (!window.matchMedia('(min-width: 1024px)').matches) {
      rail.style.transform = ''
      return
    }

    const travel = stage.offsetHeight - window.innerHeight
    const scrolled = -stage.getBoundingClientRect().top
    const progress = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0

    const maxShift = Math.max(0, rail.scrollWidth - frame.clientWidth)
    rail.style.transform = `translate3d(${-progress * maxShift}px, 0, 0)`

    setPercent((current) => {
      const next = Math.round(progress * 100)
      return next === current ? current : next
    })

    const centre = progress * maxShift + frame.clientWidth / 2
    const steps = [...rail.children] as HTMLElement[]
    const active = steps.map(
      (step) => Math.abs(centre - (step.offsetLeft + step.offsetWidth / 2)) < step.offsetWidth
    )

    setNear((current) =>
      current.length === active.length && current.every((value, i) => value === active[i])
        ? current
        : active
    )
  }, [])

  useEffect(() => {
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [update, count])

  return { section, viewport, track, percent, near }
}
