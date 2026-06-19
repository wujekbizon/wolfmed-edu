import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import TestyEgzaminyHub from '@/components/TestyEgzaminyHub'

export const metadata: Metadata = {
  title: 'Testy i egzaminy',
  description: 'Wybierz egzamin teoretyczny lub praktyczny i ćwicz przed egzaminem zawodowym MED.14',
}

export const dynamic = 'force-dynamic'

export default async function TestyEgzaminyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  return <TestyEgzaminyHub />
}
