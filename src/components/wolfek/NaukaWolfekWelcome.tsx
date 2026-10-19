'use client'

import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import LearningHubHeader from '@/components/LearningHubHeader'
import NaukaWolfekLauncher from './NaukaWolfekLauncher'
import type { NaukaWolfekNavigationProps } from '@/types/naukaLayoutTypes'

export default function NaukaWolfekWelcome({ onNavigate }: NaukaWolfekNavigationProps) {
  const [minimized, setMinimized] = useState(false)
  const welcome = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const open = () => {
    setMinimized(false)
    requestAnimationFrame(() => {
      welcome.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
      welcome.current?.querySelector<HTMLButtonElement>('[data-wolfek-focus-target]')?.focus({ preventScroll: true })
    })
  }

  return (
    <>
      <div id='nauka-wolfek-welcome' ref={welcome} hidden={minimized}>
        <LearningHubHeader onMinimize={() => setMinimized(true)} onNavigate={onNavigate} />
      </div>
      {minimized && <NaukaWolfekLauncher onOpen={open} />}
    </>
  )
}
