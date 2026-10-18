import { redirect } from 'next/navigation'
import { getTestSessionDetails } from '@/server/queries'
import { getCurrentUser } from '@/server/user'
import { getPracticeSessionQuestions, getSessionQuestions } from '@/server/testSessionQuestions'
import { getTestSessionPageState } from '@/helpers/getTestSessionPageState'
import { getPracticeProgressMeta } from '@/helpers/getPracticeProgressMeta'
import GenerateTests from '@/components/GenerateTests'
import PracticeTests from '@/components/PracticeTests'
import type { TestsByCategoryProps } from '@/types/testTypes'

export default async function TestsByCategory({ category, sessionId }: TestsByCategoryProps) {
  const decodedCategory = decodeURIComponent(category)

  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')
  if (!sessionId) return <p>Nie znaleziono szczegółów sesji testowej.</p>

  const sessionDetails = await getTestSessionDetails(sessionId, user.userId);
  if (!sessionDetails || sessionDetails.category !== decodedCategory) {
    return <p>Nie znaleziono szczegółów sesji testowej.</p>;
  }

  if (sessionDetails.mode === 'PRACTICE') {
    if (sessionDetails.status === 'COMPLETED') redirect('/panel/wyniki')
    if (sessionDetails.status !== 'ACTIVE') return <p>Nie znaleziono szczegółów sesji testowej.</p>

    const practiceQuestions = await getPracticeSessionQuestions(
      user.userId,
      sessionDetails.category,
      sessionDetails.questionIds,
      sessionId
    )
    if (practiceQuestions.length !== sessionDetails.numberOfQuestions) {
      return <p>Brak dostępnych testów. Proszę spróbować później.</p>
    }

    const tests = practiceQuestions.map((test) => ({
      id: test.id,
      data: { question: test.data.question, answers: test.data.answers.map(({ option }) => ({ option })) },
    }))
    return (
      <PracticeTests
        key={sessionId}
        tests={tests}
        sessionId={sessionId}
        initialProgress={sessionDetails.progress}
        initialVersions={getPracticeProgressMeta(sessionDetails.meta).practiceProgressVersions}
      />
    )
  }

  const sessionState = getTestSessionPageState(sessionDetails, decodedCategory)

  if (sessionState === 'COMPLETED') redirect('/panel/wyniki')

  if (sessionState === 'INVALID' || !sessionDetails) {
    return <p>Nie znaleziono szczegółów sesji testowej.</p>;
  }

  const { numberOfQuestions } = sessionDetails
  const sessionTests = await getSessionQuestions(
    user.userId,
    sessionDetails.category,
    numberOfQuestions,
    sessionId
  )

  if (sessionTests.length !== numberOfQuestions) {
    return <p>Brak dostępnych testów. Proszę spróbować później.</p>
  }

  const questions = sessionTests.map((test) => ({
    id: test.id,
    data: {
      question: test.data.question,
      answers: test.data.answers.map(({ option }) => ({ option })),
    },
  }))

  return (
    <GenerateTests
      tests={questions}
      sessionId={sessionId}
      expiresAt={sessionDetails.expiresAt.toISOString()}
    />
  );
}
