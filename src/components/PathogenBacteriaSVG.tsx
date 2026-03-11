'use client'
import { motion } from 'framer-motion'

interface PathogenBacteriaSVGProps {
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
export function PathogenBacteriaSVG({ cx, cy, r, color, driftX, driftY, duration, delay = 0 }: PathogenBacteriaSVGProps) {
  // Each individual coccus is slightly smaller than r so the cluster stays within bounds
  const cr = r * 0.38

  // Grape-like staphylococcal cluster — irregular clump typical of Staphylococcus aureus
  const cells = [
    { dx:  0,         dy: -cr * 2.0 },
    { dx: -cr * 1.1,  dy: -cr * 1.1 },
    { dx:  cr * 1.1,  dy: -cr * 1.1 },
    { dx: -cr * 2.0,  dy:  cr * 0.15 },
    { dx:  0,         dy: -cr * 0.1  },
    { dx:  cr * 2.0,  dy:  cr * 0.15 },
    { dx: -cr * 1.1,  dy:  cr * 1.2  },
    { dx:  cr * 1.1,  dy:  cr * 1.2  },
    { dx:  0,         dy:  cr * 2.2  },
  ]

  // Unique ID per placement so gradient doesn't bleed between multiple cells
  const gradId = `cocci-g-${Math.round(cx)}-${Math.round(cy)}`

  return (
    <motion.g
      animate={{ x: driftX, y: driftY }}
      transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut', delay }}
    >
      <defs>
        {/* Offset radial gradient simulates a point-light source above-left, giving each sphere a 3-D appearance */}
        <radialGradient id={gradId} cx="36%" cy="30%" r="62%">
          <stop offset="0%"   stopColor="white"  stopOpacity="0.48" />
          <stop offset="100%" stopColor={color}  stopOpacity="0"    />
        </radialGradient>
      </defs>

      {/* Soft drop-shadow shifted down-right — painted first so it sits behind all spheres */}
      {cells.map(({ dx, dy }, i) => (
        <circle key={`s${i}`}
          cx={cx + dx + cr * 0.15} cy={cy + dy + cr * 0.15}
          r={cr} fill="rgba(0,0,0,0.11)" />
      ))}

      {/* Colored base of each coccus */}
      {cells.map(({ dx, dy }, i) => (
        <circle key={`c${i}`}
          cx={cx + dx} cy={cy + dy}
          r={cr} fill={color} stroke="rgba(0,0,0,0.14)" strokeWidth="0.35" />
      ))}

      {/* Specular highlight layer on top of color — creates the spherical illusion */}
      {cells.map(({ dx, dy }, i) => (
        <circle key={`h${i}`}
          cx={cx + dx} cy={cy + dy}
          r={cr} fill={`url(#${gradId})`} />
      ))}
    </motion.g>
  )
}
