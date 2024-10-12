import UserDashboard from '@/components/UserDashboard'
import { TOTAL_TESTS_TO_COMPLETE } from '@/constants/totalTests'
import { calculateAverageScore } from '@/helpers/calculateAverageScore'
import {
  getCompletedTestCountByUser,
  getTestScoreAndQuestionCountByUser,
  getUserMotto,
  getUserUsername,
} from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'

export default async function TestsPage() {
  const user = await currentUser()
  if (!user) {
    return <p>Not signed in</p>
  }

  const username = (await getUserUsername(user.id)) as string

  const { totalScore, totalQuestions } = await getTestScoreAndQuestionCountByUser(user.id)
  const completedTestsCount = await getCompletedTestCountByUser(user.id)

  const averageScore = calculateAverageScore(totalScore, totalQuestions)
  const motto = (await getUserMotto(user.id)) as string

  return (
    <UserDashboard
      username={username}
      completedTestsCount={completedTestsCount}
      averageScore={averageScore}
      totalTests={TOTAL_TESTS_TO_COMPLETE}
      motto={motto}
    />
  )
}
