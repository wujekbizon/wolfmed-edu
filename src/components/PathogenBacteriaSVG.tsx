'use client'
import { motion } from 'framer-motion'

interface PathogenBacteriaSVGProps {
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
export function PathogenBacteriaSVG({ cx, cy, w, h, color, driftX, driftY, duration, delay = 0 }: PathogenBacteriaSVGProps) {
  const rx = h / 2
  const fLen = h * 2.2
  // Lateral sway amplitude — perpendicular to the direction of travel
  const fAmp = w * 0.18

  // S-curve path extending up (dir=-1) or down (dir=1) from a surface attachment point
  const wavyFlagellum = (x: number, y: number, dir: number) =>
    `M ${x} ${y} Q ${x + fAmp} ${y + dir * fLen * 0.35} ${x} ${y + dir * fLen * 0.55} Q ${x - fAmp} ${y + dir * fLen * 0.75} ${x + fAmp * 0.3} ${y + dir * fLen}`

  // Peritrichous distribution: 3 top, 3 bottom — staggered x so they don't overlap
  const topX    = [cx - w * 0.3, cx,           cx + w * 0.28]
  const bottomX = [cx - w * 0.28, cx + w * 0.08, cx + w * 0.3]

  const ribosomes = [
    { x: cx - w * 0.25, y: cy - h * 0.18 },
    { x: cx - w * 0.08, y: cy + h * 0.22 },
    { x: cx + w * 0.12, y: cy - h * 0.2  },
    { x: cx + w * 0.26, y: cy + h * 0.15 },
    { x: cx - w * 0.15, y: cy + h * 0.05 },
    { x: cx + w * 0.04, y: cy + h * 0.1  },
  ]

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay }}
    >
      {/* Peritrichous flagella rendered first so the rod sits on top */}
      {topX.map((x, i) => (
        <path key={`t${i}`} d={wavyFlagellum(x, cy - h / 2, -1)}
          fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth={0.35 - i * 0.03} strokeLinecap="round" />
      ))}
      {bottomX.map((x, i) => (
        <path key={`b${i}`} d={wavyFlagellum(x, cy + h / 2, 1)}
          fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth={0.35 - i * 0.03} strokeLinecap="round" />
      ))}

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
        fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.4"
      />

      {/* Two overlapping ellipses approximate the nucleoid's irregular, non-membrane-bound shape */}
      <ellipse cx={cx - w * 0.05} cy={cy}            rx={w * 0.25} ry={h * 0.3}  fill="rgba(0,0,0,0.14)" />
      <ellipse cx={cx + w * 0.08} cy={cy - h * 0.06} rx={w * 0.15} ry={h * 0.2}  fill="rgba(0,0,0,0.09)" />

      {ribosomes.map((r, i) => (
        <circle key={i} cx={r.x} cy={r.y} r={h * 0.1} fill="rgba(0,0,0,0.18)" />
      ))}
    </motion.g>
  )
}
