import { requireUser } from '@/helpers/requireUser'
import { getCompletedTestsByUser } from '@/server/queries'
import type { CompletedTest } from '@/types/dataTypes'
import CompletedTestsList from '@/components/CompletedTestsList'

export default async function CompletedTestsContent() {
  const { userId } = await requireUser()
  const completedTests = await getCompletedTestsByUser(userId)

  return <CompletedTestsList tests={completedTests as CompletedTest[]} />
}
