'use client'

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion'
import type { AuthChildrenProps } from '@/types/authTypes'

export default function AuthGlassPanel({ children }: AuthChildrenProps) {
  const x = useMotionValue(700)
  const y = useMotionValue(200)
  const reducedMotion = useReducedMotion()
  const background = useMotionTemplate`radial-gradient(500px circle at ${x}px ${y}px, #ff5b5b0d, transparent 70%)`

  return (
    <div
      className="relative grid grid-cols-[1.08fr_1fr] overflow-hidden rounded-[36px] border border-white/70 bg-white/55 p-3 shadow-[0_24px_80px_-24px_#79343f33,0_2px_6px_#79343f05] backdrop-blur-2xl max-md:grid-cols-1 max-md:rounded-[28px] max-md:p-2"
      onPointerMove={(event) => {
        if (reducedMotion || event.pointerType !== 'mouse') return
        const bounds = event.currentTarget.getBoundingClientRect()
        x.set(event.clientX - bounds.left)
        y.set(event.clientY - bounds.top)
      }}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background }} />
      {children}
    </div>
  )
}
