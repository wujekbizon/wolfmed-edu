'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HumanCellSVG } from './HumanCellSVG'
import { VirusSVG } from './VirusSVG'
import { BacteriaSVG } from './BacteriaSVG'
import { PathogenBacteriaSVG } from './PathogenBacteriaSVG'
import { AggressiveVirusSVG } from './AggressiveVirusSVG'

type EntityKind = 'cell' | 'virus' | 'bacteria' | 'pathogen' | 'aggressive'

interface Entity {
  kind: EntityKind
  left: string
  top: string
  size: number
  opacity: number
  blur: number
  driftX: number[]
  driftY: number[]
  duration: number
  delay?: number
  className?: string
}

// Scattered toward the margins — the centre stays clear so the hero card and
// its copy are never crowded. Depth reads through size + opacity + blur tiers.
const entities: Entity[] = [
  { kind: 'cell', left: '80%', top: '24%', size: 300, opacity: 0.55, blur: 1, driftX: [0, 22, -14, 8, 0], driftY: [0, -16, 12, -8, 0], duration: 28 },
  { kind: 'cell', left: '13%', top: '76%', size: 210, opacity: 0.45, blur: 1.2, driftX: [0, -18, 12, -6, 0], driftY: [0, 14, -10, 6, 0], duration: 34, delay: 4, className: 'hidden sm:block' },
  { kind: 'virus', left: '15%', top: '20%', size: 96, opacity: 0.55, blur: 0.4, driftX: [0, 16, -10, 0], driftY: [0, -12, 8, 0], duration: 18, delay: 1 },
  { kind: 'aggressive', left: '89%', top: '64%', size: 92, opacity: 0.5, blur: 0.4, driftX: [0, -14, 9, 0], driftY: [0, 11, -8, 0], duration: 20, delay: 2, className: 'hidden sm:block' },
  { kind: 'bacteria', left: '68%', top: '88%', size: 104, opacity: 0.5, blur: 0.8, driftX: [0, 18, -12, 0], driftY: [0, -10, 7, 0], duration: 22, delay: 1.5 },
  { kind: 'pathogen', left: '44%', top: '9%', size: 74, opacity: 0.45, blur: 0.8, driftX: [0, -12, 8, 0], driftY: [0, 9, -6, 0], duration: 19, delay: 3, className: 'hidden sm:block' },
]

function EntityGlyph({ kind, index }: { kind: EntityKind; index: number }) {
  if (kind === 'cell') {
    return (
      <HumanCellSVG
        id={`hero-entity-${index}`}
        type="cell"
        position={{ x: 0, y: 0 }}
        size={{ width: 100, height: 100 }}
        velocity={{ x: 0, y: 0 }}
        radius={50}
        color="rgb(198, 223, 247)"
      />
    )
  }

  const micro = { driftX: [0, 3, -2, 0], driftY: [0, -2, 3, 0] }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      {kind === 'virus' && (
        <VirusSVG cx={50} cy={50} r={30} color="rgba(166, 108, 166, 0.75)" {...micro} duration={9} />
      )}
      {kind === 'aggressive' && (
        <AggressiveVirusSVG cx={50} cy={42} r={13} color="rgba(185, 45, 45, 0.85)" {...micro} duration={10} />
      )}
      {kind === 'bacteria' && (
        <BacteriaSVG cx={44} cy={50} w={46} h={22} color="rgba(130, 166, 30, 0.65)" {...micro} duration={11} />
      )}
      {kind === 'pathogen' && (
        <PathogenBacteriaSVG cx={50} cy={50} r={22} color="rgba(90, 175, 115, 0.72)" {...micro} duration={12} />
      )}
    </svg>
  )
}

export default function HeroEntityField() {
  const reduceMotion = useReducedMotion()
  // Render client-only: these SVGs compute coordinates with Math.cos/sin whose
  // float serialization differs between server and client, and framer-motion
  // injects transforms absent in SSR — both cause hydration mismatches. The
  // field is purely decorative, so skipping SSR is correct.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden />
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {entities.map((entity, i) => (
        <div
          key={i}
          className={`absolute -translate-x-1/2 -translate-y-1/2 ${entity.className ?? ''}`}
          style={{ left: entity.left, top: entity.top, width: entity.size, height: entity.size }}
        >
          <motion.div
            className="h-full w-full"
            style={{ opacity: entity.opacity, filter: `blur(${entity.blur}px)` }}
            animate={reduceMotion ? undefined : { x: entity.driftX, y: entity.driftY }}
            transition={{
              duration: entity.duration,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: entity.delay ?? 0,
            }}
          >
            <EntityGlyph kind={entity.kind} index={i} />
          </motion.div>
        </div>
      ))}
    </div>
  )
}
