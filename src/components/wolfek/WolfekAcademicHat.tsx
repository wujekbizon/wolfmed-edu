'use client'

import { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import WolfekAcademicCap from './WolfekAcademicCap'
import type { WolfekAcademicHatProps } from '@/types/wolfekTypes'

export default function WolfekAcademicHat({ interactive = true }: WolfekAcademicHatProps) {
  const [flipping, setFlipping] = useState(false)
  const reduced = useReducedMotion()

  if (!interactive) return <span aria-hidden='true' className='pointer-events-none absolute -top-2 left-1/2 z-10 h-12 w-[86%] -translate-x-1/2'><WolfekAcademicCap flipping={false} reduced={reduced} /></span>

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
      <WolfekAcademicCap flipping={flipping} reduced={reduced} onAnimationComplete={() => setFlipping(false)} />
    </button>
  )
}
