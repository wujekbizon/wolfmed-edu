'use client'

import { createContext, useContext, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'
import { WolfekAnimationContext } from './WolfekAnimationContext'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'

export const WolfekSpeechTarget = createContext<HTMLDivElement | null>(null)

export default function WolfekSpeech({ children, revealKey, pending = false, answerKey = 0, answerText = '' }: {
  children: ReactNode; revealKey?: number; pending?: boolean; answerKey?: number; answerText?: string
}) {
  const target = useContext(WolfekSpeechTarget)
  const setActivity = useContext(WolfekAnimationContext)?.setActivity
  const speechDuration = getWolfekSpeechTiming(answerText).duration
  useEffect(() => { setActivity?.({ pending, answerKey, speechDuration }) }, [setActivity, pending, answerKey, speechDuration])
  useEffect(() => () => { setActivity?.({ pending: false, answerKey: 0 }) }, [setActivity])
  useEffect(() => {
    if (revealKey) target?.scrollIntoView({ block: 'nearest', behavior: 'auto' })
  }, [target, revealKey])
  return target ? createPortal(children, target) : null
}
