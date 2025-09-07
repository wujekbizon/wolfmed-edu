import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCompletedTest } from '@/server/queries'
import TestResultCard from '@/components/TestResultCard'
import type { CompletedTest } from '@/types/dataTypes'
import Loading from './loading'

export const experimental_ppr = true

export const metadata: Metadata = {
  title: 'Szczegółowe Wyniku Testu',
  description: 'Sprawdź swoje wyniki testów i zobacz, gdzie popełniłeś błędy!',
}

async function CompletedTest({ testId }: { testId: string }) {
  const completedTest = (await getCompletedTest(testId)) as CompletedTest
  return <TestResultCard completedTest={completedTest} />
}

export default async function TestResultPage(props: {
  params: Promise<{ testId: string }>
  searchParams: Promise<{}>
}) {
  const { testId } = await props.params
  return (
    <Suspense fallback={<Loading />}>
      <CompletedTest testId={testId} />
    </Suspense>
  )
}
