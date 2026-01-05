'use client'

import { useActionState, useCallback, useState } from 'react'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useNavigationGuard } from 'next-navigation-guard'
import { showToast, useToastMessage } from '@/hooks/useToastMessage'
import { expireSessionAction, submitTestAction } from '@/actions/actions'
import TestCard from '@/components/TestCard'
import SubmitButton from '@/components/SubmitButton'
import TestTimer from './TestTimer'
import FieldError from './FieldError'
import Input from './ui/Input'
import ConfirmLeaveModal from './ConfirmLeaveModal'
import type { Test } from '@/types/dataTypes'

export default function GenerateTests(props: { tests: Test[], sessionId: string, duration: number, questions: number }) {
  const [state, action, isPending] = useActionState(submitTestAction, EMPTY_FORM_STATE)
  const randomTest = useGeneratedTest(props.tests, props.questions)
  const noScriptFallback = useToastMessage(state);
  const [showModal, setShowModal] = useState(false)
  const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null)
  const [isTimerExpired, setIsTimerExpired] = useState(false)

  const handleTimerExpiration = useCallback(() => {
    setIsTimerExpired(true)
  }, [])

  useNavigationGuard({
    confirm: () =>
      new Promise((resolve) => {
        if (isTimerExpired) {
          // If the timer has expired, allow navigation without showing the modal
          resolve(true)
        } else {
          // Otherwise, show the modal to confirm leaving the test
          setShowModal(true)
          setResolver(() => resolve)
        }
      }),
  })

  const confirmLeave = async () => {
    try {
      const result = await expireSessionAction(props.sessionId)
      // Always succeeds now
      resolver?.(true)
    } catch (err) {
      console.error('Expire session failed:', err)
      showToast('ERROR', 'Błąd serwera przy kończeniu sesji.')
      resolver?.(false)
    } finally {
      setShowModal(false)
    }
  }

  // we blocking navigation
  const cancelLeave = () => {
    resolver?.(false)
    setShowModal(false)
  }

  return (
    <>
      {showModal && <ConfirmLeaveModal onConfirm={confirmLeave} onCancel={cancelLeave} />}

      <section className="flex h-full w-full flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-2">
          <div className="sticky top-0 z-20 w-full flex justify-end py-2 ">
            <TestTimer
              durationMinutes={props.duration}
              sessionId={props.sessionId}
              onExpiration={handleTimerExpiration}
              message="Sesja egzaminacyjna rozpoczęta, proszę ukończyć w określonym czasie."
            />
          </div>
          <form action={action} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3 ">
            <Input type="hidden" name="sessionId" value={props.sessionId} />
            {props.questions && (
              <>
                {randomTest.map((item, index) => {
                  return (
                    <div className="flex flex-col" key={`${item.id}/${index}`}>
                      <TestCard
                        formState={state}
                        test={item}
                        questionNumber={`${index + 1}/${randomTest.length}`}
                      />
                    </div>
                  )
                })}
              </>
            )}
            <div className="flex flex-col items-center pb-10">
              <div className="flex w-full flex-col sm:flex-row justify-center items-center place-self-center gap-4 rounded-lg border border-red-200/40 bg-zinc-100 lg:w-2/3 xl:w-1/2 p-4 shadow shadow-zinc-500">
                <SubmitButton
                  label="Prześlij Test"
                  loading="Przesyłam..."
                  disabled={state?.status === 'SUCCESS' || isPending}
                />
              </div>
              <div className='pt-2'>
                <FieldError name="general" formState={state} />
              </div>
            </div>
            {noScriptFallback}
          </form>
        </div>
      </section>
    </>
  )
}
