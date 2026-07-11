import { getProgressTimeline, getCategoryPerformance, getQuestionAccuracyAnalytics } from '@/server/queries'
import { getPlanProgress, getStudyMinutesTimeline } from '@/server/planner/progress'
import { fetchProblematicQuestionDetails } from '@/actions/fetchProblematicQuestionDetails'
import UserAnalyticsClient from './UserAnalyticsClient'
import { getCurrentUser } from '@/server/user'

export default async function UserAnalytics() {
  const user = await getCurrentUser()
  if (!user) return null

  const [timeline, categories, problemQuestions, plan, studyMinutes] = await Promise.all([
    getProgressTimeline(user.userId, 30),
    getCategoryPerformance(user.userId),
    getQuestionAccuracyAnalytics(user.userId),
    getPlanProgress(user.userId),
    getStudyMinutesTimeline(user.userId, 30),
  ])

  const enrichedProblemQuestions = await fetchProblematicQuestionDetails(problemQuestions)

  const minutesByDate = new Map(studyMinutes.map((entry) => [entry.date, entry.minutes]))
  const enrichedTimeline = timeline.map((point) => ({
    ...point,
    studyMinutes: minutesByDate.get(point.date) ?? 0,
  }))

  const plannedCategoryKeys = new Set(
    plan?.concepts
      .map((concept) => concept.categoryKey)
      .filter((key): key is string => Boolean(key)) ?? []
  )
  const enrichedCategories = categories.map((category) => ({
    ...category,
    inPlan: plannedCategoryKeys.has(category.category),
  }))

  return (
    <UserAnalyticsClient
      stats={{
        totalScore: user.totalScore,
        totalQuestions: user.totalQuestions,
        testsAttempted: user.testsAttempted,
      }}
      timeline={enrichedTimeline}
      categories={enrichedCategories}
      problemQuestions={enrichedProblemQuestions}
      plan={plan}
      planId={plan?.plan.id ?? null}
    />
  )
}
