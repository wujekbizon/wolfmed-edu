import CompletedTestsList from '@/components/CompletedTestsList'
import TestLoader from '@/components/TestsLoader'
import { getCompletedTestsByUser } from '@/server/queries'
import { CompletedTest } from '@/types/dataTypes'
import { currentUser } from '@clerk/nextjs/server'
import { Suspense } from 'react'

export const experimental_ppr = true

async function CompletedTests() {
  const user = await currentUser()
  if (!user) {
    return <p>Not signed in</p>
  }
  // temporarly add mock user id, later this will be replace by real user
  const completedTestsByUser = (await getCompletedTestsByUser(user?.id)) as CompletedTest[]
  return <CompletedTestsList tests={completedTestsByUser} />
}

export default function TestsResultPage() {
  return (
    <Suspense fallback={<TestLoader />}>
      <CompletedTests />
    </Suspense>
  )
}
