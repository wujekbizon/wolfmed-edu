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
  const rx = h / 2
  const rightX = cx + w / 2

  // Flagella ~1.5× body length — realistic and proportional after body was shortened
  const fLen = w * 1.5
  // Amplitude derived from body height so it scales proportionally
  const amp = h * 0.95

  // Three lophotrichous flagella with staggered phase offsets
  const flagella = [
    { y0: cy - h * 0.12, phaseShift: 0 },
    { y0: cy,            phaseShift: -amp * 0.4 },
    { y0: cy + h * 0.12, phaseShift: amp * 0.25 },
  ]

  // Ribosomes — densely scattered in cytoplasm; shown per EM-style convention
  const ribosomes = [
    { x: cx - w * 0.28, y: cy - h * 0.18 },
    { x: cx - w * 0.12, y: cy + h * 0.22 },
    { x: cx + w * 0.05, y: cy - h * 0.2  },
    { x: cx + w * 0.22, y: cy + h * 0.18 },
    { x: cx - w * 0.18, y: cy + h * 0.05 },
    { x: cx + w * 0.1,  y: cy + h * 0.08 },
  ]

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay }}
    >
      {/* Peptidoglycan cell wall — slightly larger than the membrane to suggest the extra layer */}
      <rect
        x={cx - w / 2 - 0.7} y={cy - h / 2 - 0.7}
        width={w + 1.4} height={h + 1.4}
        rx={rx + 0.7} ry={rx + 0.7}
        fill="none" stroke={color} strokeWidth="1.1" opacity="0.3"
      />

      <rect
        x={cx - w / 2} y={cy - h / 2}
        width={w} height={h}
        rx={rx} ry={rx}
        fill={color} stroke="rgba(0,0,0,0.22)" strokeWidth="0.4"
      />

      {/* Two overlapping ellipses approximate the nucleoid's irregular, non-membrane-bound shape */}
      <ellipse cx={cx - w * 0.05} cy={cy}           rx={w * 0.26} ry={h * 0.3}  fill="rgba(0,0,0,0.13)" />
      <ellipse cx={cx + w * 0.08} cy={cy - h * 0.06} rx={w * 0.16} ry={h * 0.2}  fill="rgba(0,0,0,0.08)" />

      {ribosomes.map((r, i) => (
        <circle key={i} cx={r.x} cy={r.y} r={h * 0.1} fill="rgba(0,0,0,0.17)" />
      ))}

      {/* Lophotrichous flagella bundle — sinusoidal paths mimic the helical filament projection */}
      {flagella.map(({ y0, phaseShift }, i) => (
        <path
          key={i}
          d={`
            M ${rightX} ${y0}
            Q ${rightX + fLen * 0.15} ${y0 - amp + phaseShift}
              ${rightX + fLen * 0.3}  ${y0}
            Q ${rightX + fLen * 0.45} ${y0 + amp + phaseShift * 0.5}
              ${rightX + fLen * 0.6}  ${y0}
            Q ${rightX + fLen * 0.75} ${y0 - amp * 0.7 + phaseShift}
              ${rightX + fLen * 0.9}  ${y0}
            Q ${rightX + fLen}        ${y0 + amp * 0.35}
              ${rightX + fLen * 1.05} ${y0 - amp * 0.15}
          `}
          fill="none"
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={0.35 - i * 0.04}
          strokeLinecap="round"
        />
      ))}
    </motion.g>
  )
}
