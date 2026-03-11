'use client'
import { motion } from 'framer-motion'

interface BacteriaSVGProps {
  cx: number
  cy: number
  w: number
  h: number
  color: string
  driftX: number[]
  driftY: number[]
  duration: number
  delay?: number
}

// Renders as an SVG <g> — must be used inside an <svg> element
export function BacteriaSVG({ cx, cy, w, h, color, driftX, driftY, duration, delay = 0 }: BacteriaSVGProps) {
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
      {/* Rod body */}
      <rect
        x={cx - w / 2} y={cy - h / 2}
        width={w} height={h}
        rx={h / 2} ry={h / 2}
        fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth="0.4"
      />
      {/* Internal membrane */}
      <rect
        x={cx - w / 2 + h * 0.15} y={cy - h * 0.32}
        width={w - h * 0.3} height={h * 0.64}
        rx={h * 0.32} ry={h * 0.32}
        fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.35"
      />
      {/* Nucleoid region */}
      <ellipse cx={cx} cy={cy} rx={w * 0.22} ry={h * 0.36} fill="rgba(0,0,0,0.12)" />
      {/* Flagella — trailing end */}
      <path
        d={`M ${cx + w / 2} ${cy - h * 0.15} Q ${cx + w / 2 + 4} ${cy} ${cx + w / 2 + 3} ${cy + h * 0.2}`}
        fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="0.4" strokeLinecap="round"
      />
      <path
        d={`M ${cx + w / 2} ${cy + h * 0.1} Q ${cx + w / 2 + 5} ${cy + h * 0.3} ${cx + w / 2 + 2} ${cy + h * 0.45}`}
        fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="0.35" strokeLinecap="round"
      />
    </motion.g>
  )
}
