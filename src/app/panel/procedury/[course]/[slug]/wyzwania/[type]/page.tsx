import { redirect } from 'next/navigation'
import { getProcedureBySlug, getLatestGeneratedQuiz } from '@/server/queries'
import { checkCourseAccessAction } from '@/actions/course-actions'
import { hasAccessToTier } from '@/helpers/accessTiers'
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

  const procedure = await getProcedureBySlug(course, slug) as Procedure

  if (!procedure) {
    redirect(`/panel/procedury/${course}`)
  }

  // Order-steps needs the flat algorithm shape — opiekun-medyczny only.
  if (challengeType === ChallengeType.ORDER_STEPS) {
    if (course !== 'opiekun-medyczny') {
      redirect(`/panel/procedury/${course}/${slug}/wyzwania`)
    }
    return <OrderStepsChallenge procedure={procedure} />
  }

  if (AI_CHALLENGE_TYPES.includes(challengeType as AiChallengeType)) {
    const [access, latestQuiz] = await Promise.all([
      checkCourseAccessAction(course),
      getLatestGeneratedQuiz(user.userId, procedure.id, challengeType),
    ])
    // Premium is per-course — the AI-quiz gate must reflect the tier on THIS
    // procedure's course, not premium held on any other course.
    const isPremium =
      access.hasAccess && hasAccessToTier(access.accessTier ?? 'free', 'premium')

    return (
      <GeneratedQuizExperience
        course={course}
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
