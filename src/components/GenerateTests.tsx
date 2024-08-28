'use client'

import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { Test } from '@/types/dataTypes'
import TestsLevelMenu from './TestsLevelMenu'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'
import TestCard from './TestCard'
import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { submitTestAction } from '@/actions/actions'
import { useFormState } from 'react-dom'

export default function GenerateTests(props: { tests: Test[] }) {
  const { numberTests, isTest } = useGenerateTestStore()
  const randomTest = useGeneratedTest(props.tests, numberTests)

  const [formState, action] = useFormState(submitTestAction, EMPTY_FORM_STATE)

  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 px-4 overflow-y-auto scrollbar-webkit">
      {!isTest && <TestsLevelMenu />}

      <form action={action} className="flex flex-col items-center justify-center gap-4">
        {numberTests && (
          <div className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3">
            {randomTest.map((item, index) => (
              <div className="flex flex-col" key={item.data.question}>
                <TestCard formState={formState} test={item} questionNumber={`${index + 1}/${randomTest.length}`} />
              </div>
            ))}
          </div>
        )}
      </form>
    </section>
  )
}
