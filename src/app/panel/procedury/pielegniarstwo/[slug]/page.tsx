import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPielegniastwoProcedureBySlug } from '@/lib/pielegniastwoUtils'
import PielegniastwoProcedureReader from '@/components/PielegniastwoProcedureReader'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const procedure = getPielegniastwoProcedureBySlug(slug)
  return {
    title: procedure ? procedure.name : 'Procedura pielęgniarstwa',
    description: procedure
      ? `Procedura: ${procedure.name} — ${procedure.totalPoints} punktów`
      : undefined,
  }
}

export default async function PielegniastwoProcedurePage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.id)
  const hasPielegniarstwo = courses.some((c) => c.slug === 'pielegniarstwo')
  if (!hasPielegniarstwo) redirect('/panel/procedury')

  const { slug } = await params
  const procedure = getPielegniastwoProcedureBySlug(slug)
  if (!procedure) redirect('/panel/procedury/pielegniarstwo')

  return <PielegniastwoProcedureReader procedure={procedure!} />
}
