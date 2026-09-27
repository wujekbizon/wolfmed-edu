'use client'

import { useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'
import { useReducedMotion, useSpring } from 'framer-motion'

export function useWolfekGaze() {
  const avatar = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const reduced = useReducedMotion()
  const x = useSpring(0, { stiffness: 180, damping: 24, mass: .5 })
  const y = useSpring(0, { stiffness: 180, damping: 24, mass: .5 })

  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  useEffect(() => {
    if (!reduced) return
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    x.jump(0)
    y.jump(0)
  }, [reduced, x, y])

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== 'mouse') return
    pointer.current = { x: event.clientX, y: event.clientY }
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const bounds = avatar.current?.getBoundingClientRect()
      if (!bounds?.width || !bounds.height) return
      const dx = (pointer.current.x - bounds.left - bounds.width * .5) / bounds.width
      const dy = (pointer.current.y - bounds.top - bounds.height * .475) / bounds.height
      const distance = Math.max(1, Math.hypot(dx, dy))
      x.set(dx / distance * 2.2)
      y.set(dy / distance * 1.8)
    })
  }

  const reset = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = null
    x.set(0)
    y.set(0)
  }

  return { avatar, gaze: { x, y }, follow, reset }
}
