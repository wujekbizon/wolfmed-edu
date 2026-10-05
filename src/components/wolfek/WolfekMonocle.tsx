'use client'

import { motion } from 'framer-motion'
import type { WolfekMonocleProps } from '@/types/wolfekTypes'

export default function WolfekMonocle({ dropped, reduced, interactive, onDrop }: WolfekMonocleProps) {
  const moving = dropped && !reduced
  const restingChain = 'M93 60C99 96 85 101 89 58'
  const hangingChain = 'M93 60C104 75 101 100 93 83'

  return <g>
    <motion.path stroke="#242129" strokeWidth="1.7" strokeLinecap="round"
      initial={false} animate={{ d: moving ? [restingChain, hangingChain, hangingChain, restingChain] : restingChain }}
      transition={{ duration: moving ? 2.2 : 0, times: [0, .15, .68, 1], ease: 'easeInOut' }} />
    <circle cx="93" cy="60" r="1.5" fill="#242129" />
    <motion.g initial={false} style={{ transformOrigin: '78px 57px' }}
      animate={moving ? {
        x: [0, 3, 7, 4, 4, -1, 0], y: [0, 25, 21, 25, 25, -3, 0],
        rotate: [0, 20, -12, 8, 8, -4, 0],
      } : { x: 0, y: 0, rotate: 0 }}
      transition={{ duration: moving ? 2.2 : 0, times: [0, .14, .24, .32, .68, .88, 1], ease: 'easeInOut' }}>
      <circle cx="78" cy="57" r="11" stroke="#fdfaff" strokeWidth="3.5" />
      <circle cx="78" cy="57" r="11" stroke="#242129" strokeWidth="1.8" />
      <path d="M72 50q4-4 8-2" stroke="#eee6f4" strokeWidth="1.7" strokeLinecap="round" />
    </motion.g>
    {interactive && <g role="button" tabIndex={0} aria-label="Upuść monokl Wolfka" aria-disabled={dropped}
      className="wolfek-monocle-trigger"
      onClick={(event) => { event.stopPropagation(); if (!dropped) onDrop() }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        if (!dropped) onDrop()
      }}>
      <circle cx="78" cy="57" r="24" fill="transparent" />
      <circle className="wolfek-monocle-focus" cx="78" cy="57" r="15" fill="none" />
    </g>}
  </g>
}
