import UserDashboard from '@/components/UserDashboard'
import { calculateAverageScore } from '@/helpers/calculateAverageScore'
import {
  getTestScoreAndQuestionCountByUser,
  getUserMotto,
  getUserUsername,
  getCompletedTestCountByUser,
  getSupporterByUserId,
} from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'

export default async function TestsPage() {
  const user = await currentUser()
  if (!user) notFound()

  const username = (await getUserUsername(user.id)) as string
  const { totalScore, totalQuestions } = await getTestScoreAndQuestionCountByUser(user.id)
  const testsAttempted = await getCompletedTestCountByUser(user.id)
  const averageScore = calculateAverageScore(totalScore, totalQuestions)
  const motto = (await getUserMotto(user.id)) as string
  const isSupporter = await getSupporterByUserId(user.id)

  return (
    <UserDashboard
      username={username}
      testsAttempted={testsAttempted}
      averageScore={averageScore}
      motto={motto}
      totalScore={totalScore}
      totalQuestions={totalQuestions}
      isSupporter={isSupporter}
    />
  )
}
