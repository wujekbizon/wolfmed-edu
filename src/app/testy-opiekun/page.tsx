import UserDashboard from '@/components/UserDashboard'
import { TOTAL_TESTS_TO_COMPLETE } from '@/constants/totalTests'
import { calculateAverageScore } from '@/helpers/calculateAverageScore'
import {
  getTestScoreAndQuestionCountByUser,
  getUserMotto,
  getUserUsername,
  getCompletedTestCountByUser,
  getSupporterByUserId,
} from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'

export default async function TestsPage() {
  const user = await currentUser()
  if (!user) {
    return <p>Not signed in</p>
  }

  const username = (await getUserUsername(user.id)) as string

  const { totalScore, totalQuestions } = await getTestScoreAndQuestionCountByUser(user.id)
  const testsAttempted = await getCompletedTestCountByUser(user.id)

  const averageScore = calculateAverageScore(totalScore, totalQuestions)

  // const getCachedMotto = unstable_cache(getUserMotto, [user.id], {
  //   tags: ['motto'],
  //   revalidate: 60,
  // })

  // const getCachedSuporter = unstable_cache(getSupporterByUserId, [user.id], {
  //   tags: ['supporterStatus'],
  //   revalidate: 60 * 60 * 24,
  // })

  const motto = (await getUserMotto(user.id)) as string
  const isSupporter = await getSupporterByUserId(user.id)

  return (
    <UserDashboard
      username={username}
      testsAttempted={testsAttempted}
      averageScore={averageScore}
      totalTests={TOTAL_TESTS_TO_COMPLETE}
      motto={motto}
      totalScore={totalScore}
      totalQuestions={totalQuestions}
      isSupporter={isSupporter}
    />
  )
}
