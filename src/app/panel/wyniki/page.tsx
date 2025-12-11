import { Suspense } from 'react'
import { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'
import { getCompletedTestsByUser } from '@/server/queries'
import CompletedTestsList from '@/components/CompletedTestsList'
import CompletedTestsListSkeleton from '@/components/skeletons/CompletedTestsListSkeleton'
import { CompletedTest } from '@/types/dataTypes'

export const metadata: Metadata = {
  title: 'Twoje Wyniki Testów',
  description: 'Sprawdź swoje wyniki testów i popraw się w opiece medycznej!',
  keywords:
    'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza, wyniki',
}

async function TestsResultsWithData() {
  const user = await currentUser()
  if (!user) return <CompletedTestsList tests={[]} />

  const completedTests = (await getCompletedTestsByUser(user.id)) as CompletedTest[]
  return <CompletedTestsList tests={completedTests} />
}

export default function TestsResultPage() {
  return (
    <Suspense fallback={<CompletedTestsListSkeleton />}>
      <TestsResultsWithData />
    </Suspense>
  )
}
