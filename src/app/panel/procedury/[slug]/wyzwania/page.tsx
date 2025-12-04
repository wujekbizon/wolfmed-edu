import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getChallengeProgressAction } from '@/actions/challenges'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries'
import ChallengesList from '@/components/ChallengesList'
import SupporterRequired from '@/components/SupporterRequired'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wyzwania Procedury',
  description: 'Ukończ wszystkie wyzwania aby zdobyć odznakę',
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ChallengePage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const isSupporter = await getSupporterByUserId(userId)
  if (!isSupporter) {
    return <SupporterRequired />
  }

  const { slug } = await params

  const procedure = await fileData.getProcedureBySlug(slug)

  if (!procedure) {
    redirect('/panel/procedury')
  }

  const progressResult = await getChallengeProgressAction(procedure.id, procedure.data.name)

  if (!progressResult.success) {
    return <div className="p-4 text-red-500">Failed to load progress</div>
  }

  return <ChallengesList procedure={procedure} progress={progressResult.data!} />
}
