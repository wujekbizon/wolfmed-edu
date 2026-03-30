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
  // Pointy-top hexagon cross-section approximates the icosahedral capsid of T4-class myoviruses
  const headPoints = Array.from({ length: 6 }, (_, i) => {
    const a = (i * 60 - 90) * Math.PI / 180
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')

  const tailW          = r * 0.24
  const collarH        = r * 0.28
  const tailH          = r * 1.9
  const basePlateH     = r * 0.2
  const basePlateW     = r * 0.55

  const headBottomY    = cy + r                          // bottom vertex of hex
  const tailTopY       = headBottomY + collarH
  const basePlateTopY  = tailTopY + tailH
  const basePlateBottomY = basePlateTopY + basePlateH

  // 6 tail fibers — 3 per side, curving from the base plate outward and downward
  const fiberTips: [number, number][] = [
    [cx - r * 1.8,  basePlateBottomY + r * 1.05],
    [cx - r * 1.05, basePlateBottomY + r * 1.25],
    [cx - r * 0.3,  basePlateBottomY + r * 0.8 ],
    [cx + r * 0.3,  basePlateBottomY + r * 0.8 ],
    [cx + r * 1.05, basePlateBottomY + r * 1.25],
    [cx + r * 1.8,  basePlateBottomY + r * 1.05],
  ]

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay }}
    >
      {/* Tail fibers below base plate — quadratic bezier starts vertical then fans outward */}
      {fiberTips.map(([ex, ey], i) => (
        <path key={i}
          d={`M ${cx} ${basePlateBottomY} Q ${cx} ${basePlateBottomY + r * 0.5} ${ex} ${ey}`}
          fill="none" stroke="rgba(85, 25, 130, 0.85)" strokeWidth={0.52} strokeLinecap="round" />
      ))}

      {/* Base plate — connects tail tube to the tail fibers */}
      <rect
        x={cx - basePlateW / 2} y={basePlateTopY}
        width={basePlateW} height={basePlateH}
        fill="#a82828" rx={0.3} />

      {/* Tail shaft — rigid tube that contracts on infection to inject DNA */}
      <rect
        x={cx - tailW / 2} y={tailTopY}
        width={tailW} height={tailH}
        fill="#1f6fa0" rx={tailW * 0.25} />

      {/* Collar stripes suggest the helical sheath separating capsid from tail */}
      {Array.from({ length: 3 }, (_, i) => {
        const y = headBottomY + (i / 2) * collarH
        return (
          <line key={i}
            x1={cx - tailW * 0.9} y1={y} x2={cx + tailW * 0.9} y2={y}
            stroke="rgba(0,0,0,0.28)" strokeWidth={0.35} />
        )
      })}

      {/* Icosahedral head */}
      <polygon
        points={headPoints}
        fill={color} stroke="rgba(0,0,0,0.28)" strokeWidth={0.45} />

      {/* Darker inner circle — condensed dsDNA genome visible in EM cross-sections */}
      <circle cx={cx} cy={cy} r={r * 0.42} fill="rgba(0,0,0,0.14)" />
    </motion.g>
  )
}
