'use client'

import { useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Minus } from 'lucide-react'
import Button from '@/components/ui/Button'
import ExamWolfekAvatar from '@/components/wolfek/ExamWolfekAvatar'
import NaukaWolfekLauncher from '@/components/wolfek/NaukaWolfekLauncher'
import { useWolfekGaze } from '@/hooks/useWolfekGaze'
import { EXAM_WOLFEK_WELCOME } from '@/constants/examWolfekWelcome'
import type { ExamWolfekWelcomeProps } from '@/types/examHubTypes'

export default function ExamWolfekWelcome({ active, variant = 'hub', children, answer, reviewTargetId }: ExamWolfekWelcomeProps) {
  const content = EXAM_WOLFEK_WELCOME[variant]
  const target = reviewTargetId ?? (variant === 'practice' ? 'practical-exam-sessions' : undefined)
  const [minimized, setMinimized] = useState(false)
  const eyes = useWolfekGaze()
  const welcome = useRef<HTMLDivElement>(null)
  const minimize = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()

  const open = () => {
    setMinimized(false)
    requestAnimationFrame(() => {
      welcome.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' })
      minimize.current?.focus({ preventScroll: true })
    })
  }

  return (
    <>
    <div id={`${content.id}-welcome`} ref={welcome} hidden={minimized}>
    <section aria-label='Przewodnik Wolfek' className='relative rounded-2xl border border-zinc-200/70 bg-linear-to-br from-white to-rose-50/70 shadow-sm'>
      <Button ref={minimize} variant='ghost' size='sm' onClick={() => { eyes.reset(); setMinimized(true) }} aria-expanded={!minimized} aria-controls={`${content.id}-intro`} aria-label='Zminimalizuj Wolfka' className='absolute top-1 right-1 z-10 min-h-11 min-w-11'>
        <Minus size={18} />
      </Button>
      <div id={`${content.id}-intro`} hidden={minimized} className={children ? `${variant === 'brief' ? 'exam-wolfek-brief-content ' : ''}grid min-w-0 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]` : undefined} onPointerMove={eyes.follow} onPointerLeave={eyes.reset} onPointerCancel={eyes.reset}>
        <div className='exam-wolfek-left min-w-0 p-5 pr-12 sm:p-6 sm:pr-8'>
        <div className='exam-wolfek-intro-row flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5'>
          <div className='exam-wolfek-avatar shrink-0'>
            <ExamWolfekAvatar active={active} avatarRef={eyes.avatar} gaze={eyes.gaze} accessory={variant === 'brief' ? 'nurse' : 'sheet'} {...(target ? { reviewTargetId: target } : {})} />
          </div>
          <div className='exam-wolfek-copy max-w-3xl'>
            <h2 className='text-lg font-semibold tracking-tight text-zinc-800'>{content.title}</h2>
            <p className='mt-2 text-sm leading-relaxed text-zinc-500'>{content.description}</p>
          </div>
        </div>
        {answer && <div className='exam-wolfek-answer mt-4'>{answer}</div>}
        </div>
        {children && <div className='exam-wolfek-questions min-w-0 px-5 pb-5 sm:px-6 sm:pb-6 lg:pt-6 lg:pr-14'>{children}</div>}
      </div>
    </section>
    </div>
    {minimized && <NaukaWolfekLauncher onOpen={open} controlsId={`${content.id}-welcome`} />}
    </>
  )
}
