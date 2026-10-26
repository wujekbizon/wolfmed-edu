'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function WolfekNurseHat() {
  const [replay, setReplay] = useState(0)
  const reduced = useReducedMotion()

  return (
    <div className='absolute -top-1 inset-x-6 z-10 h-12'>
      <Button variant='ghost' className='rounded-lg focus-visible:ring-rose-400' style={{ width: '100%', height: '100%', padding: 0, backgroundColor: 'transparent' }} onClick={() => setReplay((value) => value + 1)} aria-label='Porusz czepkiem Wolfka'>
        <motion.svg key={replay} aria-hidden='true' viewBox='0 0 100 60' className='h-full w-full overflow-visible drop-shadow-sm' initial={false} animate={reduced ? { y: 0, rotate: 0 } : { y: [0, -6, 0], rotate: [0, -4, 0] }} transition={{ duration: reduced ? 0 : .6, ease: 'easeInOut' }}>
          <path d='M13 12Q50 1 87 12L78 43Q50 34 22 43Z' fill='#fffdfb' stroke='#c5b4d3' strokeWidth='1.5' />
          <path d='M22 34Q50 26 78 34v9Q50 36 22 43Z' fill='#5c456f' />
          <path d='M18 15Q50 7 82 15' fill='none' stroke='#eee7f3' strokeWidth='3' strokeLinecap='round' />
          <path d='m50 14 7 7-7 7-7-7Z' fill='#c7b4d8' />
        </motion.svg>
      </Button>
    </div>
  )
}
