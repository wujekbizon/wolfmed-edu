import { Metadata } from 'next'
import { currentUser } from '@clerk/nextjs/server'
import { getCompletedTestsByUser } from '@/server/queries'
import CompletedTestsList from '@/components/CompletedTestsList'
import { CompletedTest } from '@/types/dataTypes'

export const metadata: Metadata = {
  title: 'Twoje Wyniki Testów',
  description: 'Sprawdź swoje wyniki testów i popraw się w opiece medycznej!',
  keywords:
    'opiekun, med-14, egzamin, testy, pytania, zagadnienia, medyczno-pielęgnacyjnych, opiekuńczych, baza, wyniki',
}

export default async function TestsResultPage() {
  const user = await currentUser()
  const completedTests = user ? ((await getCompletedTestsByUser(user.id)) as CompletedTest[]) : []

  return <CompletedTestsList tests={completedTests} />
}
