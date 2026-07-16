'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { VirusSVG } from './VirusSVG'
import { BacteriaSVG } from './BacteriaSVG'
import { PathogenBacteriaSVG } from './PathogenBacteriaSVG'

type MicrobeKind = 'virus' | 'bacteria' | 'pathogen'

interface Microbe {
  kind: MicrobeKind
  left: string
  top: string
  size: number
  opacity: number
  driftX: number[]
  driftY: number[]
  duration: number
  delay?: number
}

// A few residents are always visible; the swarm fades in when the section is
// hovered. Kept to the edges so the bento content stays readable.
const residents: Microbe[] = [
  { kind: 'virus', left: '6%', top: '18%', size: 30, opacity: 0.4, driftX: [0, 14, -8, 0], driftY: [0, -10, 8, 0], duration: 16 },
  { kind: 'bacteria', left: '93%', top: '30%', size: 36, opacity: 0.35, driftX: [0, -12, 8, 0], driftY: [0, 10, -6, 0], duration: 19, delay: 2 },
  { kind: 'pathogen', left: '10%', top: '78%', size: 26, opacity: 0.35, driftX: [0, 10, -8, 0], driftY: [0, -8, 6, 0], duration: 17, delay: 1 },
  { kind: 'virus', left: '90%', top: '82%', size: 24, opacity: 0.4, driftX: [0, -10, 7, 0], driftY: [0, 8, -7, 0], duration: 15, delay: 3 },
]

const swarm: Microbe[] = [
  { kind: 'virus', left: '18%', top: '10%', size: 20, opacity: 0.45, driftX: [0, 18, -10, 0], driftY: [0, -12, 9, 0], duration: 12 },
  { kind: 'bacteria', left: '30%', top: '88%', size: 28, opacity: 0.4, driftX: [0, -14, 10, 0], driftY: [0, 10, -8, 0], duration: 14, delay: 1 },
  { kind: 'pathogen', left: '45%', top: '6%', size: 18, opacity: 0.4, driftX: [0, 12, -9, 0], driftY: [0, 10, -7, 0], duration: 13, delay: 0.5 },
  { kind: 'virus', left: '60%', top: '92%', size: 22, opacity: 0.45, driftX: [0, -16, 9, 0], driftY: [0, -9, 8, 0], duration: 12, delay: 1.5 },
  { kind: 'bacteria', left: '72%', top: '8%', size: 26, opacity: 0.4, driftX: [0, 15, -10, 0], driftY: [0, 11, -8, 0], duration: 15, delay: 2 },
  { kind: 'pathogen', left: '85%', top: '55%', size: 20, opacity: 0.4, driftX: [0, -12, 8, 0], driftY: [0, -10, 7, 0], duration: 13, delay: 2.5 },
  { kind: 'virus', left: '4%', top: '48%', size: 18, opacity: 0.45, driftX: [0, 13, -8, 0], driftY: [0, 9, -7, 0], duration: 11, delay: 3 },
  { kind: 'bacteria', left: '52%', top: '96%', size: 24, opacity: 0.4, driftX: [0, -13, 9, 0], driftY: [0, -8, 7, 0], duration: 14, delay: 3.5 },
]

function MicrobeGlyph({ kind }: { kind: MicrobeKind }) {
  const micro = { driftX: [0, 2, -2, 0], driftY: [0, -2, 2, 0] }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full overflow-visible">
      {kind === 'virus' && (
        <VirusSVG cx={50} cy={50} r={26} color="rgba(255, 140, 140, 0.7)" {...micro} duration={8} />
      )}
      {kind === 'bacteria' && (
        <BacteriaSVG cx={44} cy={50} w={44} h={20} color="rgba(178, 210, 120, 0.65)" {...micro} duration={9} />
      )}
      {kind === 'pathogen' && (
        <PathogenBacteriaSVG cx={50} cy={50} r={20} color="rgba(150, 200, 160, 0.65)" {...micro} duration={10} />
      )}
    </svg>
  )
}

function MicrobeLayer({ microbes, reduceMotion }: { microbes: Microbe[]; reduceMotion: boolean }) {
  return (
    <>
      {microbes.map((m, i) => (
        <div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: m.left, top: m.top, width: m.size, height: m.size }}
        >
          <motion.div
            className="h-full w-full"
            style={{ opacity: m.opacity }}
            animate={reduceMotion ? undefined : { x: m.driftX, y: m.driftY }}
            transition={{
              duration: m.duration,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: m.delay ?? 0,
            }}
          >
            <MicrobeGlyph kind={m.kind} />
          </motion.div>
        </div>
      ))}
    </>
  )
}

export default function MicrobeSwarm() {
  const reduceMotion = useReducedMotion()
  // Client-only for the same reason as HeroEntityField: the entity SVGs'
  // Math.cos/sin float serialization differs between server and client.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <MicrobeLayer microbes={residents} reduceMotion={!!reduceMotion} />
      <div className="opacity-0 transition-opacity duration-700 group-hover/about:opacity-100">
        <MicrobeLayer microbes={swarm} reduceMotion={!!reduceMotion} />
      </div>
    </div>
  )
}
