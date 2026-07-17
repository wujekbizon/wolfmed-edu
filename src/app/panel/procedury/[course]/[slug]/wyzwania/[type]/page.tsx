import { redirect } from 'next/navigation'
import { getProcedureBySlug } from '@/server/queries'
import { ChallengeType } from '@/types/challengeTypes'
import OrderStepsChallenge from '@/components/OrderStepsChallenge'
import QuizChallengeForm from '@/components/QuizChallengeForm'
import SpotErrorChallengeForm from '@/components/SpotErrorChallengeForm'
import ScenarioChallengeForm from '@/components/ScenarioChallengeForm'
import {
  generateSpotErrorChallenge,
  generateQuizChallenge,
  generateScenarioChallenge
} from '@/helpers/challengeGenerator'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { Procedure } from '@/types/dataTypes'

export const metadata: Metadata = {
  title: 'Wyzwanie Procedury',
  description: 'Rozwiąż wyzwanie aby zdobyć postęp',
}

interface Props {
  params: Promise<{ course: string; slug: string; type: string }>
}

export default async function ChallengeTypePage({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const { course, slug, type: challengeType } = await params

  // Challenges run on the flat-algorithm format — opiekun-medyczny only for now.
  if (course !== 'opiekun-medyczny') {
    redirect(`/panel/procedury/${course}`)
  }

  const procedure = await getProcedureBySlug(course, slug) as Procedure

  if (!procedure) {
    redirect(`/panel/procedury/${course}`)
  }

  try {
    switch (challengeType) {
      case ChallengeType.ORDER_STEPS:
        return <OrderStepsChallenge procedure={procedure} />

      case ChallengeType.KNOWLEDGE_QUIZ:
        const quizChallenge = await generateQuizChallenge(procedure)
        return <QuizChallengeForm procedure={procedure} challenge={quizChallenge} />

      case ChallengeType.SPOT_ERROR:
        const spotErrorChallenge = await generateSpotErrorChallenge(procedure)
        return <SpotErrorChallengeForm procedure={procedure} challenge={spotErrorChallenge} />

      case ChallengeType.SCENARIO_BASED:
        const scenarioChallenge = await generateScenarioChallenge(procedure)
        return <ScenarioChallengeForm procedure={procedure} challenge={scenarioChallenge} />

      default:
        redirect(`/panel/procedury/${course}/${slug}/wyzwania`)
    }
  } catch (error) {
    console.error('Challenge generation failed:', error)
    redirect(`/panel/procedury/${course}/${slug}/wyzwania`)
  }
}
