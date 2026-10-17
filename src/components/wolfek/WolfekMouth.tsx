'use client'

import { useContext } from 'react'
import { motion } from 'framer-motion'
import { WolfekAnimationContext } from './WolfekAnimationContext'
import type { WolfekMouthProps } from '@/types/wolfekTypes'
import { WOLFEK_SPEECH_DELAY } from '@/constants/wolfekSpeech'

export default function WolfekMouth({ dropped, reduced }: WolfekMouthProps) {
  const animation = useContext(WolfekAnimationContext)
  const answerKey = animation?.activity.answerKey ?? 0
  const speaking = Boolean(answerKey) && !animation?.activity.pending && !dropped && !reduced
  const duration = animation?.activity.speechDuration ?? 1.95
  const repeats = Math.max(1, Math.round(duration / .65))
  const transition = { duration: speaking ? duration / repeats : 0,
    delay: speaking ? WOLFEK_SPEECH_DELAY : 0, repeat: speaking ? repeats - 1 : 0, ease: 'easeInOut' as const }
  return <g key={answerKey}>
    <motion.ellipse cx="60" cy="91" rx="3" fill="#8c7391" initial={{ ry: 0 }}
      animate={{ ry: speaking ? [0, 1.8, .3, 1.2, 0] : 0 }}
      transition={transition} />
    <motion.path d={dropped ? 'M56 93q4-5 8 0' : 'M60 85v4m0-1q-5 5-10 1m10-1q5 5 10 1'}
      stroke="#8c7391" strokeWidth="1.6" strokeLinecap="round"
      initial={{ y: 0 }} animate={{ y: speaking ? [0, .7, 0, .4, 0] : 0 }}
      transition={transition} />
  </g>
}
