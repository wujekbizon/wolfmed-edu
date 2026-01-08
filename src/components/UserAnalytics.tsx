import { getProgressTimeline, getCategoryPerformance, getQuestionAccuracyAnalytics } from '@/server/queries'
import { fetchProblematicQuestionDetails } from '@/actions/fetchProblematicQuestionDetails'
import UserAnalyticsClient from './UserAnalyticsClient'
import { getCurrentUser } from '@/server/user'

export default async function UserAnalytics() {
  const user = await getCurrentUser()
  if (!user) return null

  const [timeline, categories, problemQuestions] = await Promise.all([
    getProgressTimeline(user.userId, 30),
    getCategoryPerformance(user.userId),
    getQuestionAccuracyAnalytics(user.userId),
  ])

  const enrichedProblemQuestions = await fetchProblematicQuestionDetails(problemQuestions)

  return (
    <UserAnalyticsClient
      stats={{
        totalScore: user.totalScore,
        totalQuestions: user.totalQuestions,
        testsAttempted: user.testsAttempted,
      }}
      timeline={timeline}
      categories={categories}
      problemQuestions={enrichedProblemQuestions}
    />
  )
}
