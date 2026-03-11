'use client'
import { motion } from 'framer-motion'
import { Vector2, Size2D, ShapeType } from "@/domain/bio";

interface HumanCellSVGProps {
  id: string;
  type: ShapeType;
  position: Vector2;
  size: Size2D;
  velocity: Vector2;
  radius: number;
  color: string;
  reproductionCooldown?: number;
}

function InternalVirus({ cx, cy, r, color, driftX, driftY, duration }: {
  cx: number; cy: number; r: number; color: string;
  driftX: number[]; driftY: number[]; duration: number;
}) {
  const spikeCount = 8
  const spikeLen = r * 0.65
  const spikes = Array.from({ length: spikeCount }, (_, i) => {
    const a = (i / spikeCount) * Math.PI * 2
    return {
      x1: cx + r * Math.cos(a), y1: cy + r * Math.sin(a),
      x2: cx + (r + spikeLen) * Math.cos(a), y2: cy + (r + spikeLen) * Math.sin(a),
    }
  })
  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      {spikes.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={color} strokeWidth="0.5" opacity="0.75" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.9} fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.3" />
      <circle cx={cx} cy={cy} r={r * 0.38} fill="rgba(0,0,0,0.12)" />
    </motion.g>
  )
}

function InternalBacteria({ cx, cy, w, h, color, driftX, driftY, duration }: {
  cx: number; cy: number; w: number; h: number; color: string;
  driftX: number[]; driftY: number[]; duration: number;
}) {
  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
    >
      <rect
        x={cx - w / 2} y={cy - h / 2} width={w} height={h}
        rx={h / 2} ry={h / 2}
        fill={color} stroke="rgba(0,0,0,0.2)" strokeWidth="0.4"
      />
      <ellipse cx={cx} cy={cy} rx={w * 0.22} ry={h * 0.38} fill="rgba(0,0,0,0.12)" />
      <line x1={cx + w / 2} y1={cy - h * 0.18} x2={cx + w / 2 + 3.5} y2={cy - h * 0.18 - 1.5}
        stroke="rgba(0,0,0,0.3)" strokeWidth="0.4" />
      <line x1={cx + w / 2} y1={cy + h * 0.18} x2={cx + w / 2 + 3.5} y2={cy + h * 0.18 + 1.5}
        stroke="rgba(0,0,0,0.3)" strokeWidth="0.4" />
    </motion.g>
  )
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
        {/* Cell membrane */}
        <circle cx={cx} cy={cy} r={actualRadius} fill={color} stroke="#1a5f8a" strokeWidth={strokeW * 2} />

        {/* Cytoplasm gradient */}
        <defs>
          <radialGradient id={`cytoplasmGradient-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={actualRadius * 0.95} fill={`url(#cytoplasmGradient-${id})`} />

        {/* Organelles — independent micro-drifts (Brownian motion) */}
        <motion.circle
          cx={cx - actualRadius * 0.3} cy={cy - actualRadius * 0.2} r={organelleRadius}
          fill="rgba(255, 158, 128, 0.5)"
          animate={{ x: [0, 3, -2, 1, 0], y: [0, -2, 3, -1, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.4} cy={cy - actualRadius * 0.25} r={organelleRadius * 0.8}
          fill="rgba(255, 204, 128, 0.5)"
          animate={{ x: [0, -2, 2, -1, 0], y: [0, 3, -2, 2, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.2} cy={cy + actualRadius * 0.3} r={organelleRadius * 1.2}
          fill="rgba(161, 227, 161, 0.5)"
          animate={{ x: [0, 2, -3, 1, 0], y: [0, -1, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1 }}
        />
        <motion.circle
          cx={cx + actualRadius * 0.35} cy={cy + actualRadius * 0.2} r={organelleRadius}
          fill="rgba(213, 161, 227, 0.5)"
          animate={{ x: [0, -3, 1, 2, 0], y: [0, 2, -1, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.circle
          cx={cx - actualRadius * 0.4} cy={cy + actualRadius * 0.1} r={organelleRadius * 0.8}
          fill="rgba(244, 161, 214, 0.517)"
          animate={{ x: [0, 2, -1, 3, 0], y: [0, -3, 1, -1, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 2 }}
        />

        {/* Bacterium — drifts within the cell interior */}
        <InternalBacteria
          cx={cx - actualRadius * 0.1}
          cy={cy + actualRadius * 0.45}
          w={actualRadius * 0.28}
          h={actualRadius * 0.12}
          color="rgba(130, 166, 30, 0.6)"
          driftX={[0, -8, 5, -3, 0]}
          driftY={[0, -6, 10, -4, 0]}
          duration={9}
        />

        {/* Nucleus + Nucleolus — drift together, phase opposes primary virus (push effect) */}
        <motion.g
          animate={{ x: [-3, 2, -4, 1, 0], y: [2, -3, 1, -2, 0] }}
          transition={{ duration: 7, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
        >
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleusRadius} fill="#7da4d6" stroke="#456a96" strokeWidth={strokeW} />
          <circle cx={nucleusCx} cy={nucleusCy} r={nucleolusRadius} fill="#3f5b82" />
        </motion.g>

        {/* Viruses — drift inside cell, phase opposes nucleus drift to simulate repulsion */}
        <InternalVirus
          cx={cx - actualRadius * 0.3}
          cy={cy + actualRadius * 0.3}
          r={actualRadius * 0.09}
          color="rgba(166, 108, 166, 0.72)"
          driftX={[0, 10, -6, 8, -4, 0]}
          driftY={[0, -8, 5, -10, 4, 0]}
          duration={6}
        />
        <InternalVirus
          cx={cx + actualRadius * 0.3}
          cy={cy - actualRadius * 0.25}
          r={actualRadius * 0.07}
          color="rgba(155, 107, 181, 0.62)"
          driftX={[0, -7, 4, -9, 5, 0]}
          driftY={[0, 6, -11, 3, -7, 0]}
          duration={5}
        />

        {/* Shine */}
        <ellipse
          cx={cx} cy={cy - actualRadius * 0.2}
          rx={actualRadius * 0.4} ry={actualRadius * 0.2}
          fill="white" opacity="0.2"
        />
      </svg>
    </div>
  )
}
