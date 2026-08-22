import { useCallback, useEffect, useRef, useState } from 'react'
import { clampPercent } from '@/helpers/clampPercent'

// The track is moved by writing to its style directly rather than through
// state: this runs on every scroll frame, and re-rendering the cards at 60fps
// to change one transform is the difference between smooth and not.
export function useHorizontalPath(count: number) {
  const section = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  const [percent, setPercent] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [height, setHeight] = useState<number | null>(null)
  const [near, setNear] = useState<boolean[]>(() =>
    Array.from({ length: count }, (_, index) => index === 0)
  )

  const update = useCallback(() => {
    const stage = section.current
    const shell = card.current
    const rail = track.current
    const frame = viewport.current
    if (!stage || !shell || !rail || !frame) return

    // Below the breakpoint the steps are a plain vertical list, so any leftover
    // transform would push them off screen.
    if (!window.matchMedia('(min-width: 1280px)').matches) {
      rail.style.transform = ''
      setHeight(null)
      setPinned(false)

      // Stacked, progress is how far the list itself has travelled up the
      // viewport. Reading it from the reveal state instead would fall back to
      // zero once the last step passes the top, undoing a full bar.
      const span = stage.offsetHeight
      const travelled = window.innerHeight - stage.getBoundingClientRect().top
      setPercent(clampPercent(span > 0 ? travelled / span : 0))
      return
    }

    setPinned(true)

    // Travel comes from the track, never from the section's own height — the
    // section is sized *from* this number, and reading it back would feed a
    // measurement into its own input.
    const travel = Math.max(0, rail.scrollWidth - frame.clientWidth)

    // One pixel of scrolling moves the track one pixel. Fixing the section
    // height instead makes the pace depend on how much the cards happen to
    // overflow, which is what made this feel endless.
    //
    // The card is what pins, so the section needs to hold the card plus the
    // distance the track travels, and nothing more. Sizing from the viewport
    // left (viewport - card) of scrolling after the track had already
    // stopped, and that same distance of empty page under the card the whole
    // way down. Reading the card back is safe where reading the section would
    // not be: its height comes from the viewport, never from the value set
    // here.
    const box = getComputedStyle(stage)
    const padding = parseFloat(box.paddingTop) + parseFloat(box.paddingBottom)
    setHeight(shell.offsetHeight + padding + travel)

    const scrolled = -stage.getBoundingClientRect().top
    const progress = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0

    rail.style.transform = `translate3d(${-progress * travel}px, 0, 0)`

    setPercent(clampPercent(progress))

    const centre = progress * travel + frame.clientWidth / 2
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

  return { section, card, viewport, track, percent, near, height, pinned }
}
