import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import { getAllPracticalExams } from '@/lib/praktycznyUtils'
import TestyEgzaminyHub from '@/components/TestyEgzaminyHub'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Testy i egzaminy',
  description: 'Wybierz egzamin teoretyczny lub praktyczny i sprawdź swoją wiedzę',
}

const MONTH_ORDER: Record<string, number> = {
  Styczeń: 1, Luty: 2, Marzec: 3, Kwiecień: 4, Maj: 5, Czerwiec: 6,
  Lipiec: 7, Sierpień: 8, Wrzesień: 9, Październik: 10, Listopad: 11, Grudzień: 12,
}

function monthRank(session: string): number {
  const month = session.split(' ')[0] ?? ''
  return MONTH_ORDER[month] ?? 0
}

export default async function TestyEgzaminyPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const [courses, accessibleCategories] = await Promise.all([
    getUserEnrolledCourses(user.userId),
    getAccessibleCategories(),
  ])

  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')

  const categoryNames = accessibleCategories.map((c) => c.category)
  const questionCount = accessibleCategories.reduce((sum, c) => sum + c.count, 0)

  const practicalExams = getAllPracticalExams()
  const sessionNames = practicalExams
    .slice()
    .sort((a, b) => b.year - a.year || monthRank(b.session) - monthRank(a.session))
    .map((exam) => exam.session)

  return (
    <TestyEgzaminyHub
      categoryCount={accessibleCategories.length}
      questionCount={questionCount}
      categoryNames={categoryNames}
      practicalExamCount={practicalExams.length}
      sessionNames={sessionNames}
      hasPracticalAccess={hasOpiekun}
    />
  )
}
