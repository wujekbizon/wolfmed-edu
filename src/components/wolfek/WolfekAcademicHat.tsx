'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function WolfekAcademicHat() {
  const [flipping, setFlipping] = useState(false)
  const reduced = useReducedMotion()

  return (
    <button
      type='button'
      aria-label='Podrzuć biret Wolfka'
      title='Podrzuć biret Wolfka'
      onClick={(event) => {
        event.stopPropagation()
        if (!flipping) setFlipping(true)
      }}
      className='pointer-events-none absolute -top-2 left-1/2 z-10 h-12 w-[86%] -translate-x-1/2 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400'
    >
      <motion.svg
        aria-hidden='true'
        viewBox='0 0 120 64'
        className='pointer-events-none h-full w-full overflow-visible drop-shadow-sm'
        initial={false}
        animate={flipping && !reduced
          ? { y: [0, -28, -32, 0], rotate: [0, -12, 348, 360] }
          : { y: 0, rotate: 0 }}
        transition={{ duration: flipping && !reduced ? .85 : 0, ease: 'easeInOut' }}
        onAnimationComplete={() => setFlipping(false)}
      >
        <g className={flipping ? 'pointer-events-none' : 'pointer-events-auto'}>
        <path d='M36 29v16q24 14 48 0V29Z' fill='#574765' />
        <path d='m12 23 48-17 48 17-48 18Z' fill='#342d41' />
        <path d='m12 23 48 18 48-18' fill='none' stroke='#77618c' strokeWidth='1.5' />
        <path d='m60 23 33 7v20' fill='none' stroke='#e7bd78' strokeWidth='2.5' strokeLinecap='round' />
        <circle cx='60' cy='23' r='2.5' fill='#e7bd78' />
        <path d='m93 47-3 10h6Z' fill='#e7bd78' />
        </g>
      </motion.svg>
    </button>
  )
}
