'use client'
import { motion } from 'framer-motion'

import { VirusSVG } from './VirusSVG'
import { ShapeType, Size2D, Vector2 } from '@/types/humanCellTypes'
import { BacteriaSVG } from './BacteriaSVG'
import { PathogenBacteriaSVG } from './PathogenBacteriaSVG'
import { AggressiveVirusSVG } from './AggressiveVirusSVG'

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

  // Per-instance IDs so gradients and filters don't bleed between multiple cells
  const cytoGrad = `cyto-g-${id}`
  const nucGrad  = `nuc-g-${id}`
  const fBlur    = `f-blur-${id}`

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
        <defs>
          {/* Offset center gives a translucent depth effect rather than a flat disc */}
          <radialGradient id={cytoGrad} cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.52" />
            <stop offset="55%"  stopColor="#d8eaf8" stopOpacity="0.22" />
            <stop offset="100%" stopColor={color}   stopOpacity="0"    />
          </radialGradient>

          {/* Glassy sphere shading — bright face fades to deep blue at the rim */}
          <radialGradient id={nucGrad} cx="32%" cy="28%" r="68%">
            <stop offset="0%"   stopColor="#ccdff5" />
            <stop offset="65%"  stopColor="#6b95cb" />
            <stop offset="100%" stopColor="#3a5a88" />
          </radialGradient>

          {/* Mild Gaussian blur applied to all pathogens — softens vector edges for an organic look */}
          <filter id={fBlur} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        {/* Outer luminous halo — rendered behind everything for a premium glow */}
        <circle
          cx={cx} cy={cy} r={actualRadius + 1}
          fill="none"
          stroke="#80b8d8"
          strokeWidth={actualRadius * 0.1}
          opacity="0.14"
          style={{ filter: 'blur(7px)' }}
        />

        {/* Cell membrane — slightly softer stroke opacity than before */}
        <circle cx={cx} cy={cy} r={actualRadius}
          fill={color} stroke="#2568a0" strokeWidth={strokeW * 1.4} strokeOpacity="0.72" />

        {/* Cytoplasm illumination overlay */}
        <circle cx={cx} cy={cy} r={actualRadius * 0.97} fill={`url(#${cytoGrad})`} />

        {/* Independent stagger delays so organelles never move in sync — simulates cytoplasmic streaming */}
        <motion.circle
          cx={cx - actualRadius * 0.3} cy={cy - actualRadius * 0.2} r={organelleRadius}
          fill="rgba(255, 158, 128, 0.44)"
          animate={{ x: [0, 2, 4, 1, -1, -3, -1, 0], y: [0, -2, 0, 2, 3, 1, -1, 0] }}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.4} cy={cy - actualRadius * 0.25} r={organelleRadius * 0.8}
          fill="rgba(255, 204, 128, 0.44)"
          animate={{ x: [0, -1, -3, -2, 0, 2, 1, 0], y: [0, 2, 1, -1, -2, 0, 1, 0] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.2} cy={cy + actualRadius * 0.3} r={organelleRadius * 1.2}
          fill="rgba(161, 227, 161, 0.44)"
          animate={{ x: [0, 1, 3, 2, 0, -2, -1, 0], y: [0, -1, -3, -1, 1, 2, 0, 0] }}
          transition={{ duration: 14, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 3 }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.35} cy={cy + actualRadius * 0.2} r={organelleRadius}
          fill="rgba(213, 161, 227, 0.44)"
          animate={{ x: [0, -2, -1, 1, 3, 1, -1, 0], y: [0, 1, 3, 2, 0, -1, -2, 0] }}
          transition={{ duration: 11, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 2 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.4} cy={cy + actualRadius * 0.1} r={organelleRadius * 0.8}
          fill="rgba(244, 161, 214, 0.46)"
          animate={{ x: [0, 2, 1, -1, -2, -1, 1, 0], y: [0, -2, -1, 1, 2, 0, -1, 0] }}
          transition={{ duration: 9, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay: 4 }}
        />

        {/* Blur wrapper softens crisp vector edges so pathogens blend with the organic cytoplasm */}
        <g filter={`url(#${fBlur})`}>
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
        </g>

        <g filter={`url(#${fBlur})`}>
          <PathogenBacteriaSVG
            cx={cx + actualRadius * 0.3}
            cy={cy + actualRadius * 0.35}
            r={actualRadius * 0.14}
            color="rgba(90, 175, 115, 0.72)"
            driftX={[0, 2, 5, 4, 1, -2, -4, -2, 0]}
            driftY={[0, -4, -2, 1, 4, 3, 0, -2, 0]}
            duration={14}
            delay={1}
          />
        </g>

        {/* Nucleus grouped with nucleolus so they move as one mass; phase set opposite primary virus for push illusion */}
        <motion.g
          animate={{ x: [0, -2, -4, -2, 0, 2, 3, 1, 0], y: [0, 1, 3, 4, 2, -1, -2, -1, 0] }}
          transition={{ duration: 16, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        >
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleusRadius}
            fill={`url(#${nucGrad})`} stroke="#3a5a88" strokeWidth={strokeW * 0.8} strokeOpacity="0.55" />
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleolusRadius}
            fill="#273e60" opacity="0.82" />
          {/* Small glint at upper-left — simulates a point light source on a spherical surface */}
          <ellipse
            cx={nucleusCx - nucleusRadius * 0.22} cy={nucleusCy - nucleusRadius * 0.26}
            rx={nucleusRadius * 0.22} ry={nucleusRadius * 0.13}
            fill="white" opacity="0.2" />
        </motion.g>

        <g filter={`url(#${fBlur})`}>
          <VirusSVG
            cx={cx - actualRadius * 0.3}
            cy={cy + actualRadius * 0.3}
            r={actualRadius * 0.09}
            color="rgba(166, 108, 166, 0.72)"
            driftX={[0, 4, 7, 5, 2, -2, -5, -3, 0]}
            driftY={[0, -3, -1, 3, 6, 4, 0, -3, 0]}
            duration={15}
          />
        </g>

        <g filter={`url(#${fBlur})`}>
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
        </g>

        {/* Phage shifted left so its tail clears the nucleus — tail extends ~4.8r below the head center */}
        <g filter={`url(#${fBlur})`}>
          <AggressiveVirusSVG
            cx={cx - actualRadius * 0.52}
            cy={cy - actualRadius * 0.28}
            r={actualRadius * 0.08}
            color="rgba(185, 45, 45, 0.88)"
            driftX={[0, -3, -5, -3, 0, 3, 5, 3, 0]}
            driftY={[0, 2, 0, -3, -5, -3, 0, 2, 0]}
            duration={11}
            delay={3}
          />
        </g>

        {/* Specular cap — soft blurred highlight simulates light on the curved membrane */}
        <ellipse
          cx={cx - actualRadius * 0.04} cy={cy - actualRadius * 0.24}
          rx={actualRadius * 0.34} ry={actualRadius * 0.16}
          fill="white" opacity="0.14" style={{ filter: 'blur(3px)' }}
        />
      </svg>
    </div>
  )
}
