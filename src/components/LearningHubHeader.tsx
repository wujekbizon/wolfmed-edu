'use client'

import { useState } from 'react'
import { Minus } from 'lucide-react'
import Button from '@/components/ui/Button'
import WolfekAvatar from '@/components/wolfek/WolfekAvatar'
import WolfekAcademicHat from '@/components/wolfek/WolfekAcademicHat'
import NaukaWolfekQuestions from '@/components/wolfek/NaukaWolfekQuestions'
import NaukaWolfekAnswer from '@/components/wolfek/NaukaWolfekAnswer'
import WolfekAnswerText from '@/components/wolfek/WolfekAnswerText'
import { WolfekAnimationContext } from '@/components/wolfek/WolfekAnimationContext'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import { getWolfekSpeechTiming } from '@/helpers/getWolfekSpeechTiming'
import { NAUKA_WELCOME } from '@/constants/naukaWelcome'
import { NAUKA_WOLFEK_QUESTIONS } from '@/constants/naukaWolfekQuestions'
import type { WolfekActivity } from '@/types/wolfekTypes'
import type { NaukaWelcomeProps, NaukaWolfekQuestion } from '@/types/naukaLayoutTypes'

export default function LearningHubHeader({ onMinimize, onNavigate }: NaukaWelcomeProps) {
  const eyes = useWolfekGaze()
  const [selected, setSelected] = useState<NaukaWolfekQuestion | null>(null)
  const [activity, setActivity] = useState<WolfekActivity>({
    pending: false,
    answerKey: 1,
    speechDuration: getWolfekSpeechTiming(NAUKA_WELCOME).duration,
  })

  const selectQuestion = (id: string) => {
    const question = NAUKA_WOLFEK_QUESTIONS.find((item) => item.id === id)
    if (!question) return
    setSelected(question)
    setActivity((previous) => ({
      pending: false,
      answerKey: previous.answerKey + 1,
      speechDuration: getWolfekSpeechTiming(question.text).duration,
    }))
  }

  return (
    <WolfekAnimationContext.Provider value={{ activity, setActivity }}>
      <section
        aria-label='Powitanie Wolfka'
        onPointerMove={eyes.follow}
        onPointerLeave={eyes.reset}
        onPointerCancel={eyes.reset}
        className='relative grid grid-cols-1 items-center gap-6 rounded-2xl border border-zinc-200/70 bg-linear-to-br from-white via-white/90 to-rose-50/70 p-3 pt-5 shadow-sm sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-8'
      >
        <div className='min-w-0 space-y-4'>
        <div className='flex items-center gap-3 sm:gap-5'>
        <div ref={eyes.avatar} className='relative h-20 w-20 shrink-0 sm:h-24 sm:w-24'>
          <WolfekAvatar
            positive
            excited
            supportive
            interactive
            gaze={eyes.gaze}
            reaction={{ eventId: 'nauka-welcome', gesture: 'yes' }}
          />
          <WolfekAcademicHat />
        </div>
        <div className='min-w-0 max-w-xl pr-8'>
          <h2 className='text-base font-semibold tracking-tight text-zinc-800 sm:text-lg'>Dobrze Cię widzieć!</h2>
          <div className='mt-1.5 text-sm leading-relaxed text-zinc-500'>
            <WolfekAnswerText text={NAUKA_WELCOME} />
          </div>
        </div>
        </div>
        {selected && <NaukaWolfekAnswer key={activity.answerKey} question={selected} onNavigate={onNavigate} />}
        </div>
        <NaukaWolfekQuestions activeId={selected?.id} onSelect={selectQuestion} />
        <Button
          variant='ghost'
          size='sm'
          shape='pill'
          aria-label='Zminimalizuj Wolfka'
          data-wolfek-focus-target
          onClick={onMinimize}
          className='absolute right-1 top-1 min-h-11 min-w-11'
        >
          <Minus size={18} aria-hidden='true' />
        </Button>
      </section>
    </WolfekAnimationContext.Provider>
  )
}
