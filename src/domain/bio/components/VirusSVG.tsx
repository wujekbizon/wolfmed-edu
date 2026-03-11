'use client'
import { motion } from 'framer-motion'

interface VirusSVGProps {
  cx: number
  cy: number
  r: number
  color: string
  driftX: number[]
  driftY: number[]
  duration: number
  delay?: number
}

// Renders as an SVG <g> — must be used inside an <svg> element
export function VirusSVG({ cx, cy, r, color, driftX, driftY, duration, delay = 0 }: VirusSVGProps) {
  const spikeCount = 10
  const spikeLen = r * 0.6
  const spikes = Array.from({ length: spikeCount }, (_, i) => {
    const a = (i / spikeCount) * Math.PI * 2
    return {
      x1: cx + r * Math.cos(a),
      y1: cy + r * Math.sin(a),
      x2: cx + (r + spikeLen) * Math.cos(a),
      y2: cy + (r + spikeLen) * Math.sin(a),
    }
  })

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
    >
      {/* Spikes */}
      {spikes.map((s, i) => (
        <line
          key={i}
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={color} strokeWidth="0.5" strokeLinecap="round" opacity="0.7"
        />
      ))}
      {/* Outer shell */}
      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.85" stroke="rgba(0,0,0,0.18)" strokeWidth="0.3" />
      {/* Capsid pattern */}
      <circle cx={cx} cy={cy} r={r * 0.68} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.4" />
      {/* Genetic material core */}
      <circle cx={cx} cy={cy} r={r * 0.38} fill="rgba(0,0,0,0.13)" />
    </motion.g>
  )
}
