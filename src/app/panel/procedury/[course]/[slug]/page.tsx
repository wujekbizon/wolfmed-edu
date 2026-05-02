import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPielegniastwoProcedureBySlug } from '@/lib/pielegniastwoUtils'
import PielegniastwoProcedureReader from '@/components/PielegniastwoProcedureReader'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ course: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course, slug } = await params
  if (course === 'pielegniarstwo') {
    const procedure = getPielegniastwoProcedureBySlug(slug)
    return {
      title: procedure ? procedure.name : 'Procedura pielęgniarstwa',
      description: procedure
        ? `Procedura: ${procedure.name} — ${procedure.totalPoints} punktów`
        : undefined,
    }
  }
  return { title: 'Procedura' }
}

export default async function CourseProcedureDetailPage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const { course, slug } = await params
  const courses = await getUserEnrolledCourses(user.id)
  const isEnrolled = courses.some((c) => c.slug === course)
  if (!isEnrolled) redirect('/panel/procedury')

  if (course === 'pielegniarstwo') {
    const procedure = getPielegniastwoProcedureBySlug(slug)
    if (!procedure) redirect('/panel/procedury/pielegniarstwo')
    return <PielegniastwoProcedureReader procedure={procedure!} />
  }

  redirect(`/panel/procedury/${course}`)
}
