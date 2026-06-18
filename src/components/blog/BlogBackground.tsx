'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { longDriftAnimation } from '@/animations/motion'

interface Orb {
  size: number
  left: string
  top: string
  gradient: string
  duration: number
}

// Soft aurora orbs in the blog palette (#BB86FC purple, #8686D7 violet).
// Positioned toward the edges so they glow behind content without competing with it.
const ORBS: Orb[] = [
  {
    size: 520,
    left: '-8%',
    top: '2%',
    gradient: 'radial-gradient(circle, rgba(187,134,252,0.18) 0%, rgba(187,134,252,0) 70%)',
    duration: 16,
  },
  {
    size: 460,
    left: '70%',
    top: '12%',
    gradient: 'radial-gradient(circle, rgba(134,134,215,0.16) 0%, rgba(134,134,215,0) 70%)',
    duration: 20,
  },
  {
    size: 600,
    left: '55%',
    top: '60%',
    gradient: 'radial-gradient(circle, rgba(187,134,252,0.12) 0%, rgba(187,134,252,0) 70%)',
    duration: 22,
  },
  {
    size: 420,
    left: '-5%',
    top: '70%',
    gradient: 'radial-gradient(circle, rgba(58,58,94,0.30) 0%, rgba(58,58,94,0) 70%)',
    duration: 18,
  },
]

export default function BlogBackground() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          // @ts-ignore - framer-motion className typing
          className="absolute rounded-full blur-3xl will-change-transform"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            background: orb.gradient,
          }}
          animate={
            reduceMotion
              ? undefined
              : (longDriftAnimation(70, 70, 0, 0.04, orb.duration) as any)
          }
        />
      ))}
    </div>
  )
}
