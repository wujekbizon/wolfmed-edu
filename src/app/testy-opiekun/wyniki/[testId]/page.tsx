import { Suspense, use } from 'react'
import { Metadata } from 'next'
import { getCompletedTest } from '@/server/queries'
import TestResultCard from '@/components/TestResultCard'
import Loading from './loading'
import type { CompletedTest } from '@/types/dataTypes'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Szczegółowe Wyniku Testu',
  description: 'Sprawdź swoje wyniki testów i zobacz, gdzie popełniłeś błędy!',
}

async function CompletedTest({ testId }: { testId: string }) {
  const completedTest = (await getCompletedTest(testId)) as CompletedTest
  return <TestResultCard completedTest={completedTest} />
}

export default function TestResultPage(props: { params: Promise<{ testId: string }>; searchParams: Promise<{}> }) {
  const { testId } = use(props.params) as { testId: string }
  return (
    <Suspense fallback={<Loading />}>
      <CompletedTest testId={testId} />
    </Suspense>
  )
}
