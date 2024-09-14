import CompletedTestsList from '@/components/CompletedTestsList'
import { getCompletedTestsByUser } from '@/server/queries'
import { CompletedTest } from '@/types/dataTypes'
import { currentUser } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import Loading from './loading'

export const dynamic = 'force-dynamic'

async function CompletedTests() {
  const user = await currentUser()
  if (!user) {
    return <p>Not signed in</p>
  }

  const completedTestsByUser = (await getCompletedTestsByUser(user?.id)) as CompletedTest[]
  return <CompletedTestsList tests={completedTestsByUser} />
}

export default function TestsResultPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CompletedTests />
    </Suspense>
  )
}
