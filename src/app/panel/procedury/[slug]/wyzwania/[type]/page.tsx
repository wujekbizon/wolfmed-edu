import { redirect } from 'next/navigation'
import { fileData } from '@/server/fetchData'
import { ChallengeType } from '@/types/challengeTypes'
import OrderStepsChallenge from '@/components/OrderStepsChallenge'
import QuizChallengeForm from '@/components/QuizChallengeForm'
import VisualRecognitionChallengeForm from '@/components/VisualRecognitionChallengeForm'
import SpotErrorChallengeForm from '@/components/SpotErrorChallengeForm'
import ScenarioChallengeForm from '@/components/ScenarioChallengeForm'
import SupporterRequired from '@/components/SupporterRequired'
import {
  generateSpotErrorChallenge,
  generateQuizChallenge,
  generateVisualRecognitionChallenge,
  generateScenarioChallenge
} from '@/helpers/challengeGenerator'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'

export const metadata: Metadata = {
  title: 'Wyzwanie Procedury',
  description: 'Rozwiąż wyzwanie aby zdobyć postęp',
}

interface Props {
  params: Promise<{ slug: string; type: string }>
}

export default async function ChallengeTypePage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  if (!user.supporter) {
    return <SupporterRequired />
  }

  const { slug, type: challengeType } = await params

  const procedure = await fileData.getProcedureBySlug(slug)
  const procedures = await fileData.getAllProcedures()

  if (!procedure) {
    redirect('/panel/procedury')
  }

  try {
    switch (challengeType) {
      case ChallengeType.ORDER_STEPS:
        return <OrderStepsChallenge procedure={procedure} />

      case ChallengeType.KNOWLEDGE_QUIZ:
        const quizChallenge = await generateQuizChallenge(procedure)
        return <QuizChallengeForm procedure={procedure} challenge={quizChallenge} />

      case ChallengeType.VISUAL_RECOGNITION:
        const visualChallenge = await generateVisualRecognitionChallenge(procedure, procedures)
        return <VisualRecognitionChallengeForm procedure={procedure} allProcedures={procedures} challenge={visualChallenge} />

      case ChallengeType.SPOT_ERROR:
        const spotErrorChallenge = await generateSpotErrorChallenge(procedure)
        return <SpotErrorChallengeForm procedure={procedure} challenge={spotErrorChallenge} />

      case ChallengeType.SCENARIO_BASED:
        const scenarioChallenge = await generateScenarioChallenge(procedure)
        return <ScenarioChallengeForm procedure={procedure} challenge={scenarioChallenge} />

      default:
        redirect(`/panel/procedury/${slug}/wyzwania`)
    }
  } catch (error) {
    console.error('Challenge generation failed:', error)
    redirect(`/panel/procedury/${slug}/wyzwania`)
  }
}
