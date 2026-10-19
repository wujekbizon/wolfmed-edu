'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'
import { WOLFEK_SPEECH_DELAY } from '@/constants/wolfekSpeech'
import type { NaukaWolfekAnswerProps } from '@/types/naukaLayoutTypes'
import WolfekAnswerText from './WolfekAnswerText'

export default function NaukaWolfekAnswer({ question, onNavigate }: NaukaWolfekAnswerProps) {
  const reduced = useReducedMotion()
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const delay = reduced ? 0 : (WOLFEK_SPEECH_DELAY + getWolfekSpeechTiming(question.text).duration) * 1000
    const timeout = setTimeout(() => setFinished(true), delay)
    return () => clearTimeout(timeout)
  }, [question.text, reduced])

  return (
    <div className='wolfek-speaker-answer w-fit max-w-xl'>
    <div className='panel-wolfek-answer' role='status'>
      <WolfekAnswerText text={question.text}>
        {finished && <>{' '}<motion.a
          href={`#nauka-tab-${question.id}`}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : .3 }}
          className='font-medium text-[#80568e] underline decoration-[#80568e]/30 underline-offset-4 transition-colors hover:text-[#614278] hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400'
          onClick={(event) => {
            event.preventDefault()
            onNavigate(question.id)
          }}
        >{question.actionLabel} →</motion.a></>}
      </WolfekAnswerText>
    </div>
    </div>
  )
}
