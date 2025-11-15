import { auth } from '@clerk/nextjs/server'
import { getUserStats, getProgressTimeline, getCategoryPerformance, getQuestionAccuracyAnalytics } from '@/server/queries'
import { fetchProblematicQuestionDetails } from '@/actions/fetchProblematicQuestionDetails'
import UserAnalyticsClient from './UserAnalyticsClient'

export default async function UserAnalytics() {
  const { userId } = await auth()
  if (!userId) return null

  const [stats, timeline, categories, problemQuestions] = await Promise.all([
    getUserStats(userId),
    getProgressTimeline(userId, 30),
    getCategoryPerformance(userId),
    getQuestionAccuracyAnalytics(userId),
  ])

  const enrichedProblemQuestions = await fetchProblematicQuestionDetails(problemQuestions)

  return (
    <UserAnalyticsClient
      stats={stats}
      timeline={timeline}
      categories={categories}
      problemQuestions={enrichedProblemQuestions}
    />
  )
}
