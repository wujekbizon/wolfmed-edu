'use client'
import { motion } from 'framer-motion'

import { VirusSVG } from './VirusSVG'
import { ShapeType, Size2D, Vector2 } from '@/types/humanCellTypes'
import { BacteriaSVG } from './BacteriaSVG'

interface HumanCellSVGProps {
  id: string
  type: ShapeType
  position: Vector2
  size: Size2D
  velocity: Vector2
  radius: number
  color: string
  reproductionCooldown?: number
}

export function HumanCellSVG({
  id,
  type,
  position,
  size,
  velocity,
  radius,
  color,
  reproductionCooldown = 10,
}: HumanCellSVGProps) {
  const strokeW = 1
  const actualRadius = Math.min(size.width, size.height) / 2 - strokeW
  const nucleusRadius = actualRadius * 0.35
  const nucleolusRadius = actualRadius * 0.12
  const organelleRadius = Math.max(2, actualRadius * 0.08)
  const cx = size.width / 2
  const cy = size.height / 2
  const borderPadding = 18
  const nucleusCx = cx + actualRadius * 0.2
  const nucleusCy = cy - actualRadius * 0.1

  return (
    <div style={{ width: "100%", height: "100%", padding: borderPadding, boxSizing: "border-box" }}>
      <svg
        id={id}
        data-type={type}
        width="100%"
        height="100%"
        overflow="visible"
        style={{ position: "relative", display: "block" }}
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        <circle cx={cx} cy={cy} r={actualRadius} fill={color} stroke="#1a5f8a" strokeWidth={strokeW * 1} />

        <defs>
          <radialGradient id={`cytoplasmGradient-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={actualRadius * 0.95} fill={`url(#cytoplasmGradient-${id})`} />

        {/* Independent stagger delays so organelles never move in sync — simulates cytoplasmic streaming */}
        <motion.circle
          cx={cx - actualRadius * 0.3} cy={cy - actualRadius * 0.2} r={organelleRadius}
          fill="rgba(255, 158, 128, 0.5)"
          animate={{ x: [0, 2, 4, 1, -1, -3, -1, 0], y: [0, -2, 0, 2, 3, 1, -1, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.4} cy={cy - actualRadius * 0.25} r={organelleRadius * 0.8}
          fill="rgba(255, 204, 128, 0.5)"
          animate={{ x: [0, -1, -3, -2, 0, 2, 1, 0], y: [0, 2, 1, -1, -2, 0, 1, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.2} cy={cy + actualRadius * 0.3} r={organelleRadius * 1.2}
          fill="rgba(161, 227, 161, 0.5)"
          animate={{ x: [0, 1, 3, 2, 0, -2, -1, 0], y: [0, -1, -3, -1, 1, 2, 0, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 3 }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.35} cy={cy + actualRadius * 0.2} r={organelleRadius}
          fill="rgba(213, 161, 227, 0.5)"
          animate={{ x: [0, -2, -1, 1, 3, 1, -1, 0], y: [0, 1, 3, 2, 0, -1, -2, 0] }}
          transition={{ duration: 11, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 2 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.4} cy={cy + actualRadius * 0.1} r={organelleRadius * 0.8}
          fill="rgba(244, 161, 214, 0.517)"
          animate={{ x: [0, 2, 1, -1, -2, -1, 1, 0], y: [0, -2, -1, 1, 2, 0, -1, 0] }}
          transition={{ duration: 9, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 4 }}
        />

        {/* Slower duration than viruses — bacteria are larger so they diffuse more slowly */}
        <BacteriaSVG
          cx={cx - actualRadius * 0.1}
          cy={cy + actualRadius * 0.45}
          w={actualRadius * 0.17}
          h={actualRadius * 0.12}
          color="rgba(130, 166, 30, 0.6)"
          driftX={[0, -3, -6, -4, -1, 2, 4, 2, 0]}
          driftY={[0, -3, -1, 2, 5, 4, 1, -2, 0]}
          duration={13}
        />

        {/* Nucleus grouped with nucleolus so they move as one mass; phase set opposite primary virus for push illusion */}
        <motion.g
          animate={{ x: [0, -2, -4, -2, 0, 2, 3, 1, 0], y: [0, 1, 3, 4, 2, -1, -2, -1, 0] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        >
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleusRadius} fill="#7da4d6" stroke="#456a96" strokeWidth={strokeW} />
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleolusRadius} fill="#3f5b82" />
        </motion.g>


        <VirusSVG
          cx={cx - actualRadius * 0.3}
          cy={cy + actualRadius * 0.3}
          r={actualRadius * 0.09}
          color="rgba(166, 108, 166, 0.72)"
          driftX={[0, 4, 7, 5, 2, -2, -5, -3, 0]}
          driftY={[0, -3, -1, 3, 6, 4, 0, -3, 0]}
          duration={15}
        />


        <VirusSVG
          cx={cx + actualRadius * 0.3}
          cy={cy - actualRadius * 0.25}
          r={actualRadius * 0.07}
          color="rgba(155, 107, 181, 0.62)"
          driftX={[0, -3, -6, -4, -1, 3, 5, 2, 0]}
          driftY={[0, 3, 1, -2, -5, -3, 0, 2, 0]}
          duration={12}
          delay={2}
        />

        <ellipse
          cx={cx} cy={cy - actualRadius * 0.2}
          rx={actualRadius * 0.4} ry={actualRadius * 0.2}
          fill="white" opacity="0.2"
        />
      </svg>
    </div>
  )
}
