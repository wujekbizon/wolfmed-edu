'use client'
import { motion } from 'framer-motion'

interface AggressiveVirusSVGProps {
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
export function AggressiveVirusSVG({ cx, cy, r, color, driftX, driftY, duration, delay = 0 }: AggressiveVirusSVGProps) {
  const spikeCount = 14

  // Alternating long/medium/short spikes — creates the ragged, threatening silhouette of enveloped viruses
  const spikes = Array.from({ length: spikeCount }, (_, i) => {
    const a = (i / spikeCount) * Math.PI * 2
    const pattern = i % 3
    const sLen = pattern === 0 ? r * 0.75 : pattern === 1 ? r * 0.45 : r * 0.22
    return {
      x1: cx + r * Math.cos(a),
      y1: cy + r * Math.sin(a),
      x2: cx + (r + sLen) * Math.cos(a),
      y2: cy + (r + sLen) * Math.sin(a),
      len: sLen,
    }
  })

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay }}
    >
      {spikes.map((s, i) => (
        <line key={i}
          x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={color} strokeWidth={s.len > r * 0.5 ? 0.55 : 0.38} strokeLinecap="round" opacity="0.8"
        />
      ))}

      <circle cx={cx} cy={cy} r={r} fill={color} opacity="0.92" stroke="rgba(0,0,0,0.22)" strokeWidth="0.35" />

      {/* Two concentric rings — outer envelope and inner nucleocapsid, both visible in EM of enveloped viruses */}
      <circle cx={cx} cy={cy} r={r * 0.7}  fill="none" stroke="rgba(0,0,0,0.14)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.4" />

      <circle cx={cx} cy={cy} r={r * 0.28} fill="rgba(0,0,0,0.18)" />
    </motion.g>
  )
}
