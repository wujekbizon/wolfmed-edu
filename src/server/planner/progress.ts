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
  getUserCustomCategories,
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
  toDateKey,
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

/**
 * Real time spent on a test, clamped to the session's allotted duration so an
 * abandoned tab never counts as hours. Falls back to the nominal duration
 * (then 15 min) for legacy rows without a start timestamp.
 */
function realTestMinutes(test: {
  startedAt: Date | null
  completedAt: Date
  durationMinutes: number | null
}): number {
  const nominal = test.durationMinutes || DEFAULT_TEST_MINUTES
  if (!test.startedAt) return nominal
  const elapsed = Math.round(
    (test.completedAt.getTime() - test.startedAt.getTime()) / 60000
  )
  return Math.min(Math.max(1, elapsed), nominal)
}

// Custom-category test sessions store their category as `moje-testy__<catId>`
// (see app/panel/testy/[value]/page.tsx). Those minutes only count toward the
// learning curve when the user linked the custom category to a real subject.
const CUSTOM_CATEGORY_PREFIX = 'moje-testy__'

/**
 * Resolves a test session's raw category to the subject key the planner tracks:
 * a real curriculum category passes through; a custom category resolves to its
 * linkedCategory (or null when unlinked, so its minutes are not attributed).
 */
function resolveTestCategoryKey(
  rawCategory: string,
  linkedByCustomId: Map<string, string | null>
): string | null {
  if (!rawCategory.startsWith(CUSTOM_CATEGORY_PREFIX)) return rawCategory
  const customId = rawCategory.slice(CUSTOM_CATEGORY_PREFIX.length)
  return linkedByCustomId.get(customId) ?? null
}

async function collectActivity(
  userId: string,
  since: Date
): Promise<ActivityEntry[]> {
  const [testActivity, challengeActivity, noteActivity, logActivity, customCategories] =
    await Promise.all([
      getTestActivitySince(userId, since),
      getChallengeActivitySince(userId, since),
      getNoteActivitySince(userId, since),
      getStudyLogsSince(userId, since),
      getUserCustomCategories(userId),
    ])

  const linkedByCustomId = new Map<string, string | null>(
    customCategories.map((cat) => [cat.id, cat.linkedCategory])
  )

  const entries: ActivityEntry[] = []

  testActivity.forEach((test) => {
    entries.push({
      date: test.completedAt,
      minutes: realTestMinutes(test),
      categoryKey: resolveTestCategoryKey(test.category, linkedByCustomId),
      procedureId: null,
      conceptId: null,
    })
  })

  challengeActivity.forEach((challenge) => {
    entries.push({
      date: challenge.completedAt,
      minutes: Math.max(1, Math.round(challenge.timeSpent / 60)),
      categoryKey: null,
      procedureId: challenge.procedureId,
      conceptId: null,
    })
  })

  noteActivity.forEach((note) => {
    if (!note.createdAt) return
    entries.push({
      date: note.createdAt,
      minutes: NOTE_MINUTES,
      categoryKey: note.category,
      procedureId: null,
      conceptId: null,
    })
  })

  logActivity.forEach((log) => {
    entries.push({
      date: log.studyDate,
      minutes: log.minutes,
      categoryKey: log.categoryKey,
      procedureId: log.procedureId,
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
      const key = toDateKey(entry.date)
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

    const attributed = attributeMinutes(
      plan.concepts.map((concept) => ({
        id: concept.id,
        categoryKey: concept.categoryKey,
        procedureId: concept.procedureId,
        targetMinutes: concept.targetMinutes,
        sortOrder: concept.sortOrder,
        completedAt: concept.completedAt,
      })),
      planActivity
    )

    const concepts: ConceptProgress[] = plan.concepts.map((concept) => {
      const minutes = attributed.get(concept.id) ?? { auto: 0, manual: 0 }
      return {
        id: concept.id,
        categoryKey: concept.categoryKey,
        procedureId: concept.procedureId,
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
    const attributedMinutes = concepts.reduce(
      (total, concept) => total + concept.autoMinutes + concept.manualMinutes,
      0
    )
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
      attributedMinutes,
      unattributedMinutes: Math.max(0, actualMinutes - attributedMinutes),
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
