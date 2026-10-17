'use client'

import type { PracticeCompanionAvatarProps } from '@/types/learningUiTypes'
import WolfekAvatar from '@/components/wolfek/WolfekAvatar'

export default function PracticeCompanionAvatar({ session, interactive = false, reaction, gaze }: PracticeCompanionAvatarProps) {
  const positive = reaction ? reaction.gesture === 'yes' : session?.question?.correct === true
  const supportive = reaction ? reaction.gesture === 'no' : session?.question?.correct === false
  return <WolfekAvatar positive={positive} supportive={supportive} interactive={interactive}
    reaction={reaction} gaze={gaze} />
}
