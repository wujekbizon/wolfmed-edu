import CompletedTestsList from '@/components/CompletedTestsList'
import { USER_ID } from '@/constants/tempUser'
import { getCompletedTestsByUser } from '@/server/queries'
import { CompletedTest } from '@/types/dataTypes'
import { Suspense } from 'react'

async function CompletedTests() {
  // temporarly add mock user id, later this will be replace by real user
  const completedTestsByUser = (await getCompletedTestsByUser(USER_ID)) as CompletedTest[]
  return <CompletedTestsList tests={completedTestsByUser} />
}

export default function TestsResultPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <CompletedTests />
    </Suspense>
  )
}
