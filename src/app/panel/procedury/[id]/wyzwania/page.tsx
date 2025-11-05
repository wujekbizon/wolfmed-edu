import { redirect } from 'next/navigation'
import { getChallengeProgressAction } from '@/actions/challenges'
import { fileData } from '@/server/fetchData'
import ChallengesList from '@/components/ChallengesList'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wyzwania Procedury',
  description: 'Ukończ wszystkie wyzwania aby zdobyć odznakę',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChallengePage({ params }: Props) {
  const { id: procedureId } = await params

  const procedure = await fileData.getProcedureById(procedureId)

  if (!procedure) {
    redirect('/panel/procedury')
  }

  const progressResult = await getChallengeProgressAction(procedureId, procedure.data.name)

  if (!progressResult.success) {
    return <div className="p-4 text-red-500">Failed to load progress</div>
  }

  return <ChallengesList procedure={procedure} progress={progressResult.data!} />
}
