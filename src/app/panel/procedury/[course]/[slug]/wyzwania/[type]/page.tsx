import { redirect } from 'next/navigation'
import { getProcedureBySlug, getLatestGeneratedQuiz } from '@/server/queries'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { ChallengeType } from '@/types/challengeTypes'
import { AI_CHALLENGE_TYPES } from '@/types/generatedQuizTypes'
import type { AiChallengeType } from '@/types/generatedQuizTypes'
import { stripQuizAnswers } from '@/helpers/stripQuizAnswers'
import OrderStepsChallenge from '@/components/OrderStepsChallenge'
import GeneratedQuizExperience from '@/components/quizzes/GeneratedQuizExperience'
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

  if (challengeType === ChallengeType.ORDER_STEPS) {
    return <OrderStepsChallenge procedure={procedure} />
  }

  if (AI_CHALLENGE_TYPES.includes(challengeType as AiChallengeType)) {
    const [isPremium, latestQuiz] = await Promise.all([
      checkPremiumAccessAction(),
      getLatestGeneratedQuiz(user.userId, procedure.id, challengeType),
    ])

    return (
      <GeneratedQuizExperience
        challengeType={challengeType as AiChallengeType}
        procedureId={procedure.id}
        procedureName={procedure.data.name}
        procedureSlug={slug}
        isPremium={isPremium}
        initialQuiz={latestQuiz ? stripQuizAnswers(latestQuiz) : null}
      />
    )
  }

  redirect(`/panel/procedury/${course}/${slug}/wyzwania`)
}
