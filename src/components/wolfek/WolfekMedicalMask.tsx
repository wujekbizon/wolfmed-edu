'use client'

import { useContext } from 'react'
import { motion } from 'framer-motion'
import { WolfekAnimationContext } from './WolfekAnimationContext'
import { WOLFEK_SPEECH_DELAY } from '@/constants/wolfekSpeech'
import type { WolfekMedicalMaskProps } from '@/types/wolfekTypes'

export default function WolfekMedicalMask({ reduced }: WolfekMedicalMaskProps) {
  const animation = useContext(WolfekAnimationContext)
  const activity = animation?.activity
  const speaking = Boolean(activity?.answerKey) && !activity?.pending && !reduced
  const duration = activity?.speechDuration ?? 1.95
  const totalDuration = WOLFEK_SPEECH_DELAY + duration + .28
  const transition = {
    duration: speaking ? totalDuration : 0,
    times: [0, WOLFEK_SPEECH_DELAY / totalDuration, (WOLFEK_SPEECH_DELAY + duration) / totalDuration, 1],
    ease: 'easeInOut' as const,
  }
  const restingLoop = 'M36 76Q16 55 27 67Q15 86 38 93'
  const hangingLoop = 'M12 95Q12 78 27 67Q36 88 12 113'

  return (
    <g aria-hidden='true' className='pointer-events-none'>
      <motion.path key={`loop-${activity?.answerKey ?? 0}`} initial={{ d: restingLoop }} animate={{ d: speaking ? [restingLoop, hangingLoop, hangingLoop, restingLoop] : restingLoop }} transition={transition} fill='none' stroke='#fffdfb' strokeWidth='2' strokeLinecap='round' />
      <motion.g key={activity?.answerKey ?? 0} style={{ transformOrigin: '60px 85px', transformBox: 'view-box' }} initial={{ x: 0, y: 0, rotate: 0 }} animate={{ x: speaking ? [0, -26, -26, 0] : 0, y: speaking ? [0, 28, 28, 0] : 0, rotate: speaking ? [0, 18, 18, 0] : 0 }} transition={transition}>
        <path d='M84 76q13-7 11 5t-13 12' fill='none' stroke='#fffdfb' strokeWidth='2' strokeLinecap='round' />
        <path d='M34 75q12-1 26-7 14 6 26 7l-4 20q-22 12-44 0Z' fill='#b9e0e3' stroke='#7eafb9' strokeWidth='1.2' strokeLinejoin='round' />
        <path d='M39 77q21 6 42 0M40 84q20 6 40 0M41 91q19 6 38 0' fill='none' stroke='#87bfc7' strokeWidth='1.3' strokeLinecap='round' />
        <path d='M48 73q12-5 24 0' fill='none' stroke='#f0ffff' strokeWidth='1.5' strokeLinecap='round' />
      </motion.g>
    </g>
  )
}
