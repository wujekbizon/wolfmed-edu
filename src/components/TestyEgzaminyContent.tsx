import 'server-only'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import { getAllPracticalExams } from '@/lib/praktycznyUtils'
import TestyEgzaminyHub from '@/components/TestyEgzaminyHub'

import { getPracticalExamMonthRank } from '@/helpers/getPracticalExamMonthRank'

export default async function TestyEgzaminyContent() {
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
    .sort((a, b) => b.year - a.year || getPracticalExamMonthRank(b.session) - getPracticalExamMonthRank(a.session))
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
