import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import TestyEgzaminyHub from '@/components/TestyEgzaminyHub'

export const metadata: Metadata = {
  title: 'Testy i egzaminy',
  description: 'Wybierz egzamin teoretyczny lub praktyczny i ćwicz przed egzaminem zawodowym',
}

export const dynamic = 'force-dynamic'

export default async function TestyEgzaminyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const [courses, accessibleCategories] = await Promise.all([
    getUserEnrolledCourses(user.userId),
    getAccessibleCategories(),
  ])

  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')

  return (
    <TestyEgzaminyHub
      categoryCount={accessibleCategories.length}
      hasPracticalAccess={hasOpiekun}
    />
  )
}
