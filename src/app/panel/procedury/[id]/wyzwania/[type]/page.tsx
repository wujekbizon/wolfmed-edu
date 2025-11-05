import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { fileData } from '@/server/fetchData'
import { ChallengeType } from '@/types/challengeTypes'
import OrderStepsChallenge from '@/components/OrderStepsChallenge'
import QuizChallengeForm from '@/components/QuizChallengeForm'
import VisualRecognitionChallengeForm from '@/components/VisualRecognitionChallengeForm'
import SpotErrorChallengeForm from '@/components/SpotErrorChallengeForm'
import ScenarioChallengeForm from '@/components/ScenarioChallengeForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wyzwanie Procedury',
  description: 'Rozwiąż wyzwanie aby zdobyć postęp',
}

interface Props {
  params: Promise<{ id: string; type: string }>
}

export default async function ChallengeTypePage({ params }: Props) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id: procedureId, type: challengeType } = await params

  // Get procedure data
  const procedures = await fileData.getAllProcedures()
  const procedure = procedures.find((p) => p.id === procedureId)

  if (!procedure) {
    redirect('/panel/procedury')
  }

  // Render appropriate challenge based on type
  switch (challengeType) {
    case ChallengeType.ORDER_STEPS:
      return <OrderStepsChallenge procedure={procedure} />

    case ChallengeType.KNOWLEDGE_QUIZ:
      return <QuizChallengeForm procedure={procedure} />

    case ChallengeType.VISUAL_RECOGNITION:
      return <VisualRecognitionChallengeForm procedure={procedure} allProcedures={procedures} />

    case ChallengeType.SPOT_ERROR:
      return <SpotErrorChallengeForm procedure={procedure} />

    case ChallengeType.SCENARIO_BASED:
      return <ScenarioChallengeForm procedure={procedure} />

    default:
      redirect(`/panel/procedury/${procedureId}/wyzwania`)
  }
}
