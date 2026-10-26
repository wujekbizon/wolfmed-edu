'use client'

import { useContext } from 'react'
import WolfekAvatar from './WolfekAvatar'
import WolfekAcademicHat from './WolfekAcademicHat'
import WolfekProfessorCollar from './WolfekProfessorCollar'
import { WolfekAnimationContext } from './WolfekAnimationContext'
import type { WolfekProfessorAvatarProps } from '@/types/wolfekTypes'

export default function WolfekProfessorAvatar({ interactive = true, excited = false, gaze }: WolfekProfessorAvatarProps) {
  const animation = useContext(WolfekAnimationContext)
  const answerKey = interactive ? animation?.activity.answerKey : 0
  return (
    <span className='relative block h-full w-full'>
      <WolfekProfessorCollar />
      <WolfekAvatar positive={excited} supportive excited={excited} interactive={interactive} glasses gaze={gaze} reaction={answerKey ? { eventId: `professor-answer-${answerKey}`, gesture: 'yes' } : undefined} />
      <WolfekAcademicHat interactive={interactive} />
    </span>
  )
}
