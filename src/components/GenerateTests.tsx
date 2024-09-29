'use client'

import { useActionState, useEffect, useCallback, useState, useTransition } from 'react'
import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { submitTestAction } from '@/actions/actions'
import type { Test } from '@/types/dataTypes'
import TestsLevelMenu from './TestsLevelMenu'
import TestCard from './TestCard'
import ResetTestButton from './ResetTestButton'
import SubmitButton from './SubmitButton'
import FieldError from './FieldError'

export default function GenerateTests(props: { tests: Test[] }) {
  const { numberTests, isTest, setNumberTests, setIsTest } = useGenerateTestStore()
  const [state, action] = useActionState(submitTestAction, EMPTY_FORM_STATE)
  const [localState, setLocalState] = useState(EMPTY_FORM_STATE)
  const randomTest = useGeneratedTest(props.tests, numberTests)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setLocalState(state)
  }, [state])

  useEffect(() => {
    if (localState.status === 'SUCCESS') {
      setNumberTests(null)
      setIsTest(false)
    }
  }, [localState.status === 'SUCCESS'])

  const resetTest = useCallback(() => {
    setNumberTests(null)
    setIsTest(false)
    setLocalState(EMPTY_FORM_STATE)
  }, [setNumberTests, setIsTest])

  const handleSubmit = useCallback(
    (formData: FormData) => {
      startTransition(() => {
        action(formData)
      })
    },
    [action]
  )

  useEffect(() => {
    return () => {
      resetTest()
    }
  }, [resetTest])

  return (
    <section className="flex w-full flex-col items-center gap-8 p-0 sm:p-4">
      {!isTest && (
        <div className="w-full h-full flex items-center justify-center">
          <TestsLevelMenu />
        </div>
      )}
      {isTest && (
        <div className="flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-2">
          <form action={handleSubmit} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3 ">
            {numberTests && (
              <>
                {randomTest.map((item, index) => (
                  <div className="flex flex-col" key={`${item.id}/${index}`}>
                    <TestCard formState={localState} test={item} questionNumber={`${index + 1}/${randomTest.length}`} />
                    <FieldError formState={localState} name={`answer-${item.id}`} />
                  </div>
                ))}
              </>
            )}
            <div className="flex flex-col pb-10">
              <div className="flex w-full flex-col sm:flex-row justify-center items-center place-self-center gap-4 rounded-lg border border-red-200/40 bg-zinc-100 lg:w-2/3 xl:w-1/2 p-4 shadow shadow-zinc-500">
                <SubmitButton
                  label="Prześlij Test"
                  loading="Przesyłam..."
                  disabled={localState?.status === 'SUCCESS' || isPending}
                />
                <ResetTestButton resetTest={resetTest} disabled={isPending} />
              </div>
              {localState.status === 'ERROR' && localState.message && (
                <div className="text-red-500 text-center text-sm">{localState.message}</div>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
