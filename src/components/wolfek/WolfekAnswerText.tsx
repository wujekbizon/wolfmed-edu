'use client'

import { Fragment } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'
import { WOLFEK_SPEECH_DELAY, WOLFEK_WORD_FADE } from '@/constants/wolfekSpeech'

export default function WolfekAnswerText({ text, animate = true }: { text: string; animate?: boolean }) {
  const reduced = useReducedMotion()
  const { interval } = getWolfekSpeechTiming(text)
  let word = 0
  if (reduced || !animate) return <p className="whitespace-pre-line">{text}</p>
  return <p key={text} className="whitespace-pre-line">
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{text.split(/(\s+)/).map((token, index) => {
      if (!token || /^\s+$/.test(token)) return <Fragment key={index}>{token}</Fragment>
      const delay = WOLFEK_SPEECH_DELAY + word++ * interval
      return <motion.span key={index} className="inline-block"
        initial={{ opacity: 0, y: 2, filter: 'blur(1px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ delay, duration: WOLFEK_WORD_FADE, ease: 'easeOut' }}>{token}</motion.span>
    })}</span>
  </p>
}
