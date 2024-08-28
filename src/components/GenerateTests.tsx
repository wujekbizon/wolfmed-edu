'use client'

import { useGenerateTestStore } from '@/store/useGenerateTestStore'
import { Test } from '@/types/dataTypes'
import TestsLevelMenu from './TestsLevelMenu'
import { useGeneratedTest } from '@/hooks/useGeneratedTest'

export default function GenerateTests(props: { tests: Test[] }) {
  const { numberTests, isTest } = useGenerateTestStore()
  const randomTest = useGeneratedTest(props.tests, numberTests)

  return (
    <section className="flex  w-full flex-col items-center gap-8 px-4">
      {!isTest && <TestsLevelMenu />}

      <form action="" className="flex w-full flex-col items-center justify-center gap-4">
        {numberTests && (
          <div className="grid w-full grid-cols-1 gap-4 pb-24 lg:grid-cols-2 xl:w-5/6">
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
