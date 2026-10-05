'use client'

import { Minus } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Tooltip } from '@/components/Tooltip'
import { WolfekSpeechTarget } from './WolfekSpeech'
import { WolfekAnimationContext } from './WolfekAnimationContext'
import WolfekThinkingDots from './WolfekThinkingDots'
import type { WolfekActivity, WolfekGlassCardProps } from '@/types/wolfekTypes'

export default function WolfekGlassCard({ avatarRef, avatar, avatarStatus, avatarActions, children, className, glassClassName,
  surfaceClassName, onMinimize, onPointerMove, onPointerLeave, onPointerCancel }: WolfekGlassCardProps) {
  const [speechTarget, setSpeechTarget] = useState<HTMLDivElement | null>(null)
  const [activity, setActivity] = useState<WolfekActivity>({ pending: false, answerKey: 0 })
  return <WolfekAnimationContext.Provider value={{ activity, setActivity }}>
    <WolfekSpeechTarget.Provider value={speechTarget}><div className={`wolfek-card-wrap wolfek-speaking-card ${className ?? ''}`} onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave} onPointerCancel={onPointerCancel}>
    <div className={`wolfek-glass ${glassClassName ?? ''}`}>
      <div className={`wolfek-glass-surface ${surfaceClassName ?? ''}`} aria-hidden="true" />
      {onMinimize && <Tooltip message="Zminimalizuj Wolfka" position="bottom-left"
        className="wolfek-minimize-tooltip">
        <button type="button" className="wolfek-minimize" data-wolfek-focus-target onClick={onMinimize}
          aria-label="Zminimalizuj Wolfka"><Minus size={16} /></button>
      </Tooltip>}
      {children}
      <div className="wolfek-speaker">
        <div className="wolfek-speaker-head">
          <div ref={avatarRef} className="wolfek-card-avatar">
            {avatar}{avatarStatus}
            <AnimatePresence>{activity.pending && <WolfekThinkingDots />}</AnimatePresence>
          </div>
          {avatarActions}
        </div>
      </div>
    </div>
    <div className="wolfek-speaker-answer"><div ref={setSpeechTarget} className="wolfek-speech-content" /></div>
  </div></WolfekSpeechTarget.Provider></WolfekAnimationContext.Provider>
}
