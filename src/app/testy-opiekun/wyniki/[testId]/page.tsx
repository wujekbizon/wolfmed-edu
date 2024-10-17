import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCompletedTest } from '@/server/queries'
import type { CompletedTest } from '@/types/dataTypes'
import Loading from './loading'
import TestResultCard from '@/components/TestResultCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Szczegółowe Wyniku Testu',
  description: 'Sprawdź swoje wyniki testów i zobacz, gdzie popełniłeś błędy!',
}

async function CompletedTest({ testId }: { testId: string }) {
  const completedTest = (await getCompletedTest(testId)) as CompletedTest
  return <TestResultCard completedTest={completedTest} />
}

export default function TestResultPage(props: { params: { testId: string }; searchParams: {} }) {
  return (
    <Suspense fallback={<Loading />}>
      <CompletedTest testId={props.params.testId} />
    </Suspense>
  )
}
