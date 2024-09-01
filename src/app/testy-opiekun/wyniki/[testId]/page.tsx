import TestResultCard from '@/components/TestResultCard'
import { getCompletedTest } from '@/server/queries'
import type { CompletedTest } from '@/types/dataTypes'
import { Suspense } from 'react'

async function CompletedTest({ testId }: { testId: string }) {
  const completedTest = (await getCompletedTest(testId)) as CompletedTest

  return <TestResultCard completedTest={completedTest} />
}

export default function TestResultPage(props: { params: { testId: string }; searchParams: {} }) {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CompletedTest testId={props.params.testId} />
    </Suspense>
  )
}
