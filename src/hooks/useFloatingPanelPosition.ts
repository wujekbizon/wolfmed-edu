'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useReducedMotion } from 'framer-motion'

export function useFloatingPanelPosition(anchorId: string | undefined, minimized: boolean, mounted: boolean) {
  const panel = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const reduced = useReducedMotion()
  const [compact, setCompact] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = panel.current
    if (!element) return
    const scroller = document.getElementById('scroll-container')
    const target = anchorId ? document.getElementById(anchorId) : null
    let frame = 0
    let first = true
    let measuredHeight = element.offsetHeight
    let movement: { stop: () => void } | undefined
    const place = () => {
      const viewport = window.visualViewport
      const width = viewport?.width ?? window.innerWidth
      const height = viewport?.height ?? window.innerHeight
      const offset = viewport?.offsetTop ?? 0
      const small = width < 1280
      setCompact(small)
      const box = target?.getBoundingClientRect()
      const bounds = scroller?.getBoundingClientRect()
      const panelWidth = Math.min(344, width - 24)
      const top = Math.max(offset + 12, bounds?.top ?? 80)
      const bottom = Math.min(offset + height - 12, bounds?.bottom ?? height - 12)
      const panelHeight = Math.min(element.offsetHeight || 390, bottom - top)
      const left = small ? width - panelWidth - 12 : Math.min(box ? box.right + 24 : width - panelWidth - 24, width - panelWidth - 16)
      const nextY = small ? bottom - panelHeight : Math.max(top, Math.min(box?.top ?? top, bottom - panelHeight))
      movement?.stop()
      x.set(Math.max(12, left))
      if (first && !reduced && !small) movement = animate(y, nextY, { duration: 0.3, ease: 'easeOut' })
      else y.set(nextY)
      first = false
      setReady(true)
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(place)
    }
    const observer = new ResizeObserver(() => {
      if (element.offsetHeight === measuredHeight) return
      measuredHeight = element.offsetHeight
      schedule()
    })
    observer.observe(element)
    if (scroller) observer.observe(scroller)
    if (target) observer.observe(target)
    place()
    scroller?.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('resize', schedule)
    window.visualViewport?.addEventListener('scroll', schedule)
    return () => {
      movement?.stop()
      cancelAnimationFrame(frame)
      observer.disconnect()
      scroller?.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('resize', schedule)
      window.visualViewport?.removeEventListener('scroll', schedule)
    }
  }, [anchorId, minimized, mounted, reduced, x, y])
  return { panel, x, y, compact, ready }
}
