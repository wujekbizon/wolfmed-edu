import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPublicPracticalExamById } from '@/lib/praktycznyUtils'
import PracticalExamRunner from '@/components/PracticalExamRunner'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const exam = getPublicPracticalExamById(slug)
  return {
    title: exam ? exam.title : 'Egzamin praktyczny',
    description: exam ? `Arkusz ${exam.arkusz} — część praktyczna MED.14` : undefined,
  }
}

export const dynamic = 'force-dynamic'

export default async function PracticalExamPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.userId)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  if (!hasOpiekun) redirect('/panel/testy-egzaminy')

  const { slug } = await params
  const exam = getPublicPracticalExamById(slug)
  if (!exam) redirect('/panel/egzaminy')

  return <PracticalExamRunner exam={exam} />
}
