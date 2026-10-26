'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { WolfekGlassesProps } from '@/types/wolfekTypes'

export default function WolfekGlasses({ reduced, interactive }: WolfekGlassesProps) {
  const [replay, setReplay] = useState(0)

  return (
    <g role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? 'Popraw okulary Wolfka' : undefined} className={interactive ? 'wolfek-glasses-trigger' : undefined}
      onClick={(event) => { event.stopPropagation(); if (interactive) setReplay((value) => value + 1) }}
      onKeyDown={(event) => {
        if (!interactive || (event.key !== 'Enter' && event.key !== ' ')) return
        event.preventDefault()
        event.stopPropagation()
        setReplay((value) => value + 1)
      }}>
      <motion.g key={replay} initial={false} animate={reduced || replay === 0 ? { y: 0 } : { y: [0, -3, 0] }} transition={{ duration: reduced ? 0 : .45, ease: 'easeInOut' }}>
        <g stroke='#574765' strokeWidth='2.2'>
          <rect x='30' y='46' width='24' height='22' rx='8' fill='#eee6f4' fillOpacity='.12' />
          <rect x='66' y='46' width='24' height='22' rx='8' fill='#eee6f4' fillOpacity='.12' />
          <path d='M54 54q6-5 12 0M30 51l-8-3m68 3 8-3' strokeLinecap='round' />
        </g>
        <path d='M35 50h9m27 0h9' stroke='#fffdfb' strokeOpacity='.8' strokeWidth='1.5' strokeLinecap='round' />
      </motion.g>
      {interactive && <rect className='wolfek-glasses-focus' x='26' y='40' width='68' height='32' rx='10' fill='transparent' />}
    </g>
  )
}
