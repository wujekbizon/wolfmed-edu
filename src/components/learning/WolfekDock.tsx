'use client'

import { useSettingsStore } from '@/store/useSettingsStore'
import type { WolfekDockProps } from '@/types/learningUiTypes'
import WolfekOverlay from '@/components/wolfek/WolfekOverlay'
import PracticeCompanionAvatar from './PracticeCompanionAvatar'

export default function WolfekDock({ userId, questionId, session, children, reaction }: WolfekDockProps) {
  const hidden = useSettingsStore((state) => state.practiceCompanionHidden[userId] ?? false)
  const setHidden = useSettingsStore((state) => state.setPracticeCompanionHidden)
  const minimize = () => setHidden(userId, true)
  const open = () => setHidden(userId, false)

  return <WolfekOverlay anchorId={questionId ? `learning-card-${questionId}` : undefined}
    visible={!hidden} onMinimize={minimize} onOpen={open}
    avatar={<PracticeCompanionAvatar session={session} reaction={reaction} />}>
    {children}
  </WolfekOverlay>
}
