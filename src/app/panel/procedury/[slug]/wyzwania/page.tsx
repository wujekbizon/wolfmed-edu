import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getChallengeProgressAction } from '@/actions/challenges'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries'
import ChallengesList from '@/components/ChallengesList'
import SupporterRequired from '@/components/SupporterRequired'
import { Metadata } from 'next'
import ChallengesListSkeleton from '@/components/skeletons/ChallengesListSkeleton'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Wyzwania Procedury',
  description: 'Ukończ wszystkie wyzwania aby zdobyć odznakę',
}


async function ChallengeContent(props: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const isSupporter = await getSupporterByUserId(userId)
  if (!isSupporter) {
    return <SupporterRequired />
  }

  const { slug } = await props.params

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

export default function ChallengePage(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ChallengesListSkeleton />}>
      <ChallengeContent params={props.params} />
    </Suspense>
  )
}
