'use client'

import { useState } from 'react'
import { WOLFEK_SMALL_TALK } from '@/constants/wolfekMessages'
import { useSettingsStore } from '@/store/useSettingsStore'
import type { WolfekDockProps } from '@/types/learningUiTypes'
import WolfekOverlay from '@/components/wolfek/WolfekOverlay'
import PracticeCompanionAvatar from './PracticeCompanionAvatar'

export default function WolfekDock({ userId, questionId, session, children, reaction }: WolfekDockProps) {
  const [smallTalkIndex, setSmallTalkIndex] = useState(0)
  const hidden = useSettingsStore((state) => state.practiceCompanionHidden[userId] ?? false)
  const setHidden = useSettingsStore((state) => state.setPracticeCompanionHidden)
  const minimize = () => setHidden(userId, true)
  const open = () => {
    setSmallTalkIndex((current) => (current + 1) % WOLFEK_SMALL_TALK.length)
    setHidden(userId, false)
  }

  return <WolfekOverlay anchorId={questionId ? `learning-card-${questionId}` : undefined}
    visible={!hidden} onMinimize={minimize} onOpen={open}
    avatar={<PracticeCompanionAvatar session={session} reaction={reaction} />}>
    {(minimize) => children(minimize, smallTalkIndex)}
  </WolfekOverlay>
}
