import 'server-only'
import { cache } from 'react'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import {
  getActivePlanWithConcepts,
  getCategoryPerformance,
  getChallengeActivitySince,
  getNoteActivitySince,
  getStudyLogsSince,
  getTestActivitySince,
} from '@/server/queries'
import {
  activityDayKeys,
  attributeMinutes,
  computeExpectedMinutes,
  computePaceStatus,
  computeStreak,
  countMissedStudyDays,
  isStudyDay,
  pickDailySuggestion,
  sumMinutes,
  sumMinutesForDay,
} from './engine'
import type {
  ActivityEntry,
  ConceptProgress,
  ConceptSource,
  PlanGoalType,
  PlanProgress,
  PlanStatus,
} from '@/types/plannerTypes'

const DAY_MS = 24 * 60 * 60 * 1000
const STREAK_WINDOW_DAYS = 60
const DEFAULT_TEST_MINUTES = 15
const NOTE_MINUTES = 10

async function collectActivity(
  userId: string,
  since: Date
): Promise<ActivityEntry[]> {
  const [testActivity, challengeActivity, noteActivity, logActivity] =
    await Promise.all([
      getTestActivitySince(userId, since),
      getChallengeActivitySince(userId, since),
      getNoteActivitySince(userId, since),
      getStudyLogsSince(userId, since),
    ])

  const entries: ActivityEntry[] = []

  testActivity.forEach((test) => {
    entries.push({
      date: test.completedAt,
      minutes: test.durationMinutes || DEFAULT_TEST_MINUTES,
      categoryKey: test.category,
      conceptId: null,
    })
  })

  challengeActivity.forEach((challenge) => {
    entries.push({
      date: challenge.completedAt,
      minutes: Math.max(1, Math.round(challenge.timeSpent / 60)),
      categoryKey: null,
      conceptId: null,
    })
  })

  noteActivity.forEach((note) => {
    if (!note.createdAt) return
    entries.push({
      date: note.createdAt,
      minutes: NOTE_MINUTES,
      categoryKey: note.category,
      conceptId: null,
    })
  })

  logActivity.forEach((log) => {
    entries.push({
      date: log.studyDate,
      minutes: log.minutes,
      categoryKey: null,
      conceptId: log.conceptId,
    })
  })

  return entries
}

/**
 * Per-day study minutes across all activity sources (tests, challenges, notes,
 * manual logs) for the last `days`. Powers the effort series on the analytics
 * timeline — independent of whether the user has an active plan.
 */
export const getStudyMinutesTimeline = cache(
  async (
    userId: string,
    days = 30
  ): Promise<Array<{ date: string; minutes: number }>> => {
    const since = new Date(Date.now() - days * DAY_MS)
    const activity = await collectActivity(userId, since)

    const byDay = new Map<string, number>()
    activity.forEach((entry) => {
      const key = entry.date.toISOString().split('T')[0]
      if (!key) return
      byDay.set(key, (byDay.get(key) ?? 0) + entry.minutes)
    })

    return Array.from(byDay.entries())
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }
)

export const getPlanProgress = cache(
  async (userId: string): Promise<PlanProgress | null> => {
    const plan = await getActivePlanWithConcepts(userId)
    if (!plan) return null

    const now = new Date()
    const streakStart = new Date(now.getTime() - STREAK_WINDOW_DAYS * DAY_MS)
    const activitySince = new Date(
      Math.min(plan.createdAt.getTime(), streakStart.getTime())
    )

    const [allActivity, categoryPerformance] = await Promise.all([
      collectActivity(userId, activitySince),
      getCategoryPerformance(userId),
    ])

    const planActivity = allActivity.filter(
      (entry) => entry.date.getTime() >= plan.createdAt.getTime()
    )

    const attributed = attributeMinutes(plan.concepts, planActivity)

    const concepts: ConceptProgress[] = plan.concepts.map((concept) => {
      const minutes = attributed.get(concept.id) ?? { auto: 0, manual: 0 }
      return {
        id: concept.id,
        categoryKey: concept.categoryKey,
        label: concept.label,
        source: concept.source as ConceptSource,
        targetMinutes: concept.targetMinutes,
        sortOrder: concept.sortOrder,
        completedAt: concept.completedAt?.toISOString() ?? null,
        autoMinutes: minutes.auto,
        manualMinutes: minutes.manual,
      }
    })

    const dayKeys = activityDayKeys(allActivity)
    const actualMinutes = sumMinutes(planActivity)
    const todayMinutes = sumMinutesForDay(planActivity, now)
    const expectedMinutesToDate = computeExpectedMinutes(
      plan.createdAt,
      now,
      plan.studyDays,
      plan.minutesPerDay
    )
    const missedDays = countMissedStudyDays(
      plan.createdAt,
      now,
      plan.studyDays,
      dayKeys
    )

    const categoryAccuracy = new Map<string, number>()
    categoryPerformance.forEach((category) => {
      categoryAccuracy.set(category.category, parseFloat(category.avgScore))
    })

    const daysLeft = Math.max(
      0,
      Math.ceil((plan.dueDate.getTime() - now.getTime()) / DAY_MS)
    )

    return {
      plan: {
        id: plan.id,
        courseSlug: plan.courseSlug,
        name: plan.name,
        goalType: plan.goalType as PlanGoalType,
        focusCategoryKey: plan.focusCategoryKey,
        focusLabel: plan.focusCategoryKey
          ? CATEGORY_METADATA[plan.focusCategoryKey]?.title ??
            plan.focusCategoryKey
              .split('-')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ')
          : null,
        dueDate: plan.dueDate.toISOString(),
        minutesPerDay: plan.minutesPerDay,
        studyDays: plan.studyDays,
        status: plan.status as PlanStatus,
        createdAt: plan.createdAt.toISOString(),
      },
      concepts,
      plannedTotalMinutes: concepts.reduce(
        (total, concept) => total + concept.targetMinutes,
        0
      ),
      expectedMinutesToDate,
      actualMinutes,
      todayMinutes,
      paceStatus: computePaceStatus(
        expectedMinutesToDate,
        actualMinutes,
        missedDays
      ),
      streak: computeStreak(dayKeys, plan.studyDays, now),
      daysLeft,
      todayIsStudyDay: isStudyDay(now, plan.studyDays),
      suggestion: pickDailySuggestion(
        concepts,
        categoryAccuracy,
        plan.minutesPerDay,
        todayMinutes
      ),
    }
  }
)
