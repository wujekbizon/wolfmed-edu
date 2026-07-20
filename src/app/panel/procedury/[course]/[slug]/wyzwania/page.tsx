import { redirect } from 'next/navigation'
import { getChallengeProgressAction } from '@/actions/challenges'
import { getProcedureBySlug } from '@/server/queries'
import ChallengesHub from '@/components/quizzes/ChallengesHub'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { Procedure } from '@/types/dataTypes'

export const metadata: Metadata = {
  title: 'Wyzwania Procedury',
  description: 'Ukończ wszystkie wyzwania aby zdobyć odznakę',
}

interface Props {
  params: Promise<{ course: string; slug: string }>
}

export default async function ChallengePage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const { course, slug } = await params

  const procedure = await getProcedureBySlug(course, slug) as Procedure

  if (!procedure) {
    redirect(`/panel/procedury/${course}`)
  }

  const progressResult = await getChallengeProgressAction(procedure.id, procedure.data.name)

  if (!progressResult.success) {
    return <div className="p-4 text-red-500">Failed to load progress</div>
  }

  return (
    <ChallengesHub
      course={course}
      procedureName={procedure.data.name}
      procedureSlug={slug}
      progress={progressResult.data!}
    />
  )
}
