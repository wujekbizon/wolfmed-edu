import { redirect } from 'next/navigation'
import { getChallengeProgressAction } from '@/actions/challenges'
import { getProcedureBySlug } from '@/server/queries'
import ChallengesList from '@/components/ChallengesList'
import SupporterRequired from '@/components/SupporterRequired'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { Procedure } from '@/types/dataTypes'

export const metadata: Metadata = {
  title: 'Wyzwania Procedury',
  description: 'Ukończ wszystkie wyzwania aby zdobyć odznakę',
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ChallengePage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  if (!user.supporter) {
    return <SupporterRequired />
  }

  const { slug } = await params

  const procedure = await getProcedureBySlug(slug) as Procedure

  if (!procedure) {
    redirect('/panel/procedury')
  }

  const progressResult = await getChallengeProgressAction(procedure.id, procedure.data.name)

  if (!progressResult.success) {
    return <div className="p-4 text-red-500">Failed to load progress</div>
  }

  return <ChallengesList procedure={procedure} progress={progressResult.data!} />
}
