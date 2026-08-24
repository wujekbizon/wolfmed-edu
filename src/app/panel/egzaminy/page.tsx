import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getAllPublicPracticalExams } from '@/lib/praktycznyUtils'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import PracticalExamList from '@/components/PracticalExamList'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Egzamin praktyczny — Opiekun medyczny',
  description: 'Wierne arkusze egzaminacyjne MED.14 części praktycznej. Wypełnij dokumentację i sprawdź się przed egzaminem.',
}

export default async function PracticalExamsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.userId)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  if (!hasOpiekun) redirect('/panel/testy-egzaminy')

  const exams = getAllPublicPracticalExams()
  const isPremium = await checkPremiumAccessAction()

  return <PracticalExamList exams={exams} isPremium={isPremium} />
}
