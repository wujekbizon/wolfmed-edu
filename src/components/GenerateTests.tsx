'use client'

import { useActionState, useEffect } from 'react'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import { useTestFormState } from '@/hooks/useTestFormState'
import { useTestSubmission } from '@/hooks/useTestSubmission'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { submitTestAction } from '@/actions/actions'
import type { Test } from '@/types/dataTypes'
import TestsLevelMenu from '@/components/TestsLevelMenu'
import TestCard from '@/components/TestCard'
import ResetTestButton from '@/components/ResetTestButton'
import SubmitButton from '@/components/SubmitButton'

export default function GenerateTests(props: { tests: Test[] }) {
  const [state, action] = useActionState(submitTestAction, EMPTY_FORM_STATE)
  const { numberTests, isTest, localState, resetTest } = useTestFormState(state)
  const { isPending, handleSubmit } = useTestSubmission(action)
  const randomTest = useGeneratedTest(props.tests, numberTests)

  // Reset the test form when the component unmounts
  useEffect(() => {
    return () => {
      resetTest()
    }
  }, [resetTest])

  return (
    <section className="flex w-full flex-col items-center gap-8 p-0 sm:p-4">
      {!isTest ? (
        <div className="w-full h-full flex items-center justify-center">
          <TestsLevelMenu />
        </div>
      ) : (
        <div className="flex w-full flex-col items-center overflow-y-auto scrollbar-webkit p-2">
          <form action={handleSubmit} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3 ">
            {numberTests && (
              <>
                {randomTest.map((item, index) => {
                  return (
                    <div className="flex flex-col" key={`${item.id}/${index}`}>
                      <TestCard
                        formState={localState}
                        test={item}
                        questionNumber={`${index + 1}/${randomTest.length}`}
                      />
                    </div>
                  )
                })}
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
