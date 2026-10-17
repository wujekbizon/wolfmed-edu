import { notFound } from 'next/navigation'
import { getCompletedTest } from '@/server/queries'
import type { CompletedTest } from '@/types/dataTypes'
import TestResultCard from './TestResultCard'

export default async function TestResultContent({ testId }: { testId: string }) {
  const completedTest = await getCompletedTest(testId)
  if (!completedTest) notFound()
  return <TestResultCard completedTest={completedTest as CompletedTest} />
}
