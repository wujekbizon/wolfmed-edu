'use client'

import { useFormState } from 'react-dom'
import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import TestsLevelMenu from './TestsLevelMenu'
import TestCard from './TestCard'
import { Test } from '@/types/dataTypes'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { submitTestAction } from '@/actions/actions'
import ResetTestButton from './ResetTestButton'
import SubmitButton from './SubmitButton'
import { useActionState, useEffect } from 'react'
import FieldError from './FieldError'

export default function GenerateTests(props: { tests: Test[] }) {
  const { numberTests, isTest, setNumberTests, setIsTest } = useGenerateTestStore()
  const [formState, action] = useActionState(submitTestAction, EMPTY_FORM_STATE)
  const randomTest = useGeneratedTest(props.tests, numberTests)

  useEffect(() => {
    if (formState.status === 'SUCCESS') {
      setNumberTests(null)
      setIsTest(false)
    }
  }, [formState.status === 'SUCCESS'])

  return (
    <section className="flex w-full flex-col items-center gap-8 overflow-y-auto scrollbar-webkit p-4 sm:p-12">
      {!isTest && (
        <div className="w-full h-full flex items-center justify-center">
          <TestsLevelMenu />
        </div>
      )}

      <form action={action} className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3">
        {numberTests && (
          <>
            {randomTest.map((item, index) => (
              <div className="flex flex-col" key={item.data.question}>
                <TestCard formState={formState} test={item} questionNumber={`${index + 1}/${randomTest.length}`} />
                <FieldError formState={formState} name={`answer-${item.data.question}`} />
              </div>
            ))}
          </>
        )}
        {isTest && (
          <div className="flex w-full flex-col sm:flex-row justify-center items-center place-self-center gap-4 rounded-lg border border-red-200/40 bg-[#f58a8a] lg:w-2/3 xl:w-1/2 p-4 shadow shadow-zinc-500">
            <SubmitButton label="Prześlij Test" loading="Przesyłam..." disabled={formState?.status === 'SUCCESS'} />
            <ResetTestButton />
          </div>
        )}
      </form>
    </section>
  )
}
