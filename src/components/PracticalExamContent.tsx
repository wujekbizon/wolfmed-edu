import 'server-only'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses, getGeneratedPracticalExamById } from '@/server/queries'
import { getPublicPracticalExamById, toPublicExam } from '@/lib/praktycznyUtils'
import PracticalExamRunner from '@/components/PracticalExamRunner'

import type { PracticalExamRouteProps } from '@/types/practicalExamRouteTypes'

export default async function PracticalExamContent({ params }: PracticalExamRouteProps) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.userId)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  if (!hasOpiekun) redirect('/panel/testy-egzaminy')

  const { slug } = await params
  let exam = getPublicPracticalExamById(slug)
  if (!exam) {
    const generated = await getGeneratedPracticalExamById(slug, user.userId)
    if (generated) exam = toPublicExam(generated)
  }
  if (!exam) redirect('/panel/egzaminy')

  return <PracticalExamRunner exam={exam} />
}
