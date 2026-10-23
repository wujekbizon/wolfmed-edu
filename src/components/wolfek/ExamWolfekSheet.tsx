'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ExamWolfekProps } from '@/types/examHubTypes'

export default function ExamWolfekSheet({ active }: ExamWolfekProps) {
  const reduced = useReducedMotion()

  return (
    <motion.svg aria-hidden='true' viewBox='0 0 48 60' className='pointer-events-none absolute inset-0 h-16 w-12 overflow-visible drop-shadow-sm'
      initial={reduced ? false : { rotate: 0, y: 4 }} animate={{ rotate: -8, y: 0 }} transition={{ duration: reduced ? 0 : .4 }}>
      <path d='M7 2h27l9 9v43a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z' fill='#fffdfb' stroke='#e9cbd7' />
      <path d='M34 2v7a2 2 0 0 0 2 2h7' fill='#f3edf8' stroke='#e9cbd7' />
      <path d='M11 13h13' stroke='#bb9fc9' strokeWidth='2' strokeLinecap='round' />
      {[23, 35, 47].map((y, index) => (
        <g key={y}>
          {active === 'theory' ? <circle cx='13' cy={y} r='3.5' fill='none' stroke='#d6c6df' /> : <rect x='9.5' y={y - 3.5} width='7' height='7' rx='1' fill='none' stroke='#d6c6df' />}
          <motion.path d={`M21 ${y}h13`} stroke='#aa8dbb' strokeWidth='2' strokeLinecap='round'
            initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : .3, delay: reduced ? 0 : .2 + index * .3 }} />
          <motion.path d={active === 'theory' ? `M11 ${y}h4` : `m11 ${y} 1.5 1.5 3-3`} stroke='#a13f57' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'
            initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: reduced ? 0 : .25, delay: reduced ? 0 : .45 + index * .3 }} />
        </g>
      ))}
    </motion.svg>
  )
}
