'use client'

import { useActionState, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { submitTestAction } from '@/actions/actions'
import TestCard from '@/components/TestCard'
import SubmitButton from '@/components/SubmitButton'
import TestTimer from './TestTimer'
import FieldError from './FieldError'
import Input from './ui/Input'
import type { ExamQuestion } from '@/types/dataTypes'
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat'
import { useBeaconCleanup } from '@/hooks/useBeaconCleanup'

export default function GenerateTests(props: {
  tests: ExamQuestion[]
  sessionId: string
  duration: number
}) {
  const [state, action, isPending] = useActionState(
    submitTestAction,
    EMPTY_FORM_STATE
  )
  const router = useRouter()
  const noScriptFallback = useToastMessage(state)
  useSessionHeartbeat(props.sessionId)
  useBeaconCleanup(props.sessionId)
  const [isTimerExpired, setIsTimerExpired] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!state.values) return

    const restored = Object.fromEntries(
      Object.entries(state.values).flatMap(([key, value]) => {
        if (!key.startsWith('answer-') || typeof value !== 'string') return []
        const selectedIndex = Number(value)
        return Number.isInteger(selectedIndex)
          ? [[key.slice('answer-'.length), selectedIndex]]
          : []
      })
    )

    if (Object.keys(restored).length) {
      setSelectedAnswers((current) => ({ ...current, ...restored }))
    }
  }, [state.values])

  useEffect(() => {
    if (state.status === 'SUCCESS') {
      router.push('/panel/wyniki')
    }
  }, [state.status, router])

  const handleTimerExpiration = useCallback(() => {
    setIsTimerExpired(true)
  }, [])
  return (
    <section className='flex h-full w-full flex-col items-center gap-8'>
      <div className='flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-2'>
        <div className='sticky top-0 z-20 w-full flex justify-end py-2 '>
          <TestTimer
            durationMinutes={props.duration}
            sessionId={props.sessionId}
            onExpiration={handleTimerExpiration}
            message='Sesja egzaminacyjna rozpoczęta, proszę ukończyć w określonym czasie.'
          />
        </div>
        <form
          action={action}
          className='grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3 '
        >
          <Input type='hidden' name='sessionId' value={props.sessionId} />
          {props.tests.length > 0 && (
            <>
              {props.tests.map((item, index) => {
                return (
                  <div className='flex flex-col' key={`${item.id}/${index}`}>
                    <TestCard
                      formState={state}
                      test={item}
                      questionNumber={`${index + 1}/${props.tests.length}`}
                      selectedIndex={selectedAnswers[item.id] ?? null}
                      onSelect={(selectedIndex) => setSelectedAnswers((current) => ({
                        ...current,
                        [item.id]: selectedIndex,
                      }))}
                    />
                  </div>
                )
              })}
            </>
          )}
          <div className='flex flex-col items-center pb-10'>
            <div className='flex w-full flex-col sm:flex-row justify-center items-center place-self-center gap-4 rounded-lg border border-red-200/40 bg-zinc-100 lg:w-2/3 xl:w-1/2 p-4 shadow shadow-zinc-500'>
              <SubmitButton
                label='Prześlij Test'
                loading='Przesyłam...'
                disabled={state?.status === 'SUCCESS' || isPending}
              />
            </div>
            <div className='pt-2'>
              <FieldError name='general' formState={state} />
            </div>
          </div>
          {noScriptFallback}
        </form>
      </div>
    </section>
  )
}
