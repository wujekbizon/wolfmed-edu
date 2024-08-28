'use client'

import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { Test } from '@/types/dataTypes'
import TestsLevelMenu from './TestsLevelMenu'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'

export default function GenerateTests(props: { tests: Test[] }) {
  const { numberTests, isTest } = useGenerateTestStore()
  const randomTest = useGeneratedTest(props.tests, numberTests)

  return (
    <section className="flex w-full flex-col items-center justify-center gap-8 px-4 overflow-y-auto scrollbar-webkit">
      {!isTest && <TestsLevelMenu />}

      <form action="" className="flex flex-col items-center justify-center gap-4">
        {numberTests && (
          <div className="grid w-full grid-cols-1 gap-8 lg:w-3/4 xl:w-2/3">
            {randomTest.map((item) => (
              <div className="flex flex-col" key={item.data.question}>
                {item.data.question}
              </div>
            ))}
          </div>
        )}
      </form>
    </section>
  )
}
