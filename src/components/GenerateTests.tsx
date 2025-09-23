'use client'

import { useActionState, useState } from 'react'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { expireSession, submitTestAction } from '@/actions/actions'
import type { Test } from '@/types/dataTypes'
import TestCard from '@/components/TestCard'
import SubmitButton from '@/components/SubmitButton'
import TestTimer from './TestTimer'
import FieldError from './FieldError'
import Input from './ui/Input'
import { useNavigationGuard } from 'next-navigation-guard'

function ConfirmLeaveModal({ onConfirm, onCancel }: { onConfirm: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-sm text-center">
        <p className="mb-4 text-lg font-semibold">
          Are you sure you want to leave the test?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Stay
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Leave & Expire
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GenerateTests(props: { tests: Test[], sessionId: string, durationMinutes: number, numberOfQuestions: number }) {
  const [state, action, isPending] = useActionState(submitTestAction, EMPTY_FORM_STATE)
  const randomTest = useGeneratedTest(props.tests, props.numberOfQuestions)

  const [showModal, setShowModal] = useState(false)
  const [resolver, setResolver] = useState<((val: boolean) => void) | null>(null)

  useNavigationGuard({
    confirm: () =>
      new Promise((resolve) => {
        setShowModal(true)
        setResolver(() => resolve)
      }),
  })

  const confirmLeave = async () => {
    await expireSession(props.sessionId)
    resolver?.(true) // allow navigation
    setShowModal(false)
  }

  const cancelLeave = () => {
    resolver?.(false) // block navigation
    setShowModal(false)
  }

  return (
    <>
    {showModal && <ConfirmLeaveModal onConfirm={confirmLeave} onCancel={cancelLeave} />}

    <section className="flex h-full w-full flex-col items-center gap-8">
      <div className="flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-2">
        <div className="sticky top-0 z-50 w-full flex justify-center py-2 bg-zinc-900/80 backdrop-blur-sm">
          <TestTimer
            durationMinutes={props.durationMinutes}
            sessionId={props.sessionId}
          />
        </div>
        <form action={action} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3 ">
          <Input type="hidden" name="sessionId" value={props.sessionId} />
          {props.numberOfQuestions && (
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
        </form>
      </div>
    </section>
  </>
  )
}
