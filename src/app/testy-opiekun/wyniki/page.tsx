import CompletedTestsList from '@/components/CompletedTestsList'
import TestLoader from '@/components/TestsLoader'
import { USER_ID } from '@/constants/tempUser'
import { getCompletedTestsByUser } from '@/server/queries'
import { CompletedTest } from '@/types/dataTypes'
import { Suspense } from 'react'

export const experimental_ppr = true

async function CompletedTests() {
  // temporarly add mock user id, later this will be replace by real user
  const completedTestsByUser = (await getCompletedTestsByUser(USER_ID)) as CompletedTest[]
  return <CompletedTestsList tests={completedTestsByUser} />
}

export default function TestsResultPage() {
  return (
    <Suspense fallback={<TestLoader />}>
      <CompletedTests />
    </Suspense>
  )
}
