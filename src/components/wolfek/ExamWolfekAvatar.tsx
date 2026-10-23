'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import WolfekAvatar from '@/components/wolfek/WolfekAvatar'
import ExamWolfekSheet from '@/components/wolfek/ExamWolfekSheet'
import { useExamWolfekReview } from '@/hooks/useExamWolfekReview'
import type { ExamWolfekAvatarProps } from '@/types/examHubTypes'

export default function ExamWolfekAvatar({ active, avatarRef, gaze, reviewTargetId }: ExamWolfekAvatarProps) {
  const [replay, setReplay] = useState(0)
  const reviewGaze = useExamWolfekReview({ active, replay, avatarRef, gaze, reviewTargetId })

  return (
    <div ref={avatarRef} className='relative h-32 w-32 shrink-0'>
      <div className='absolute inset-2'>
        <WolfekAvatar positive supportive excited interactive gaze={reviewGaze} />
      </div>
      <Button variant='ghost' className='absolute -right-1 bottom-0 rounded-lg focus-visible:ring-rose-400' style={{ width: 48, height: 64, padding: 0, backgroundColor: 'transparent' }} onClick={() => setReplay((value) => value + 1)} aria-label='Wolfek przegląda arkusz — odtwórz animację'>
        <ExamWolfekSheet key={active + replay} active={active} />
      </Button>
    </div>
  )
}
