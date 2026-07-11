import type {
  ActivityEntry,
  ConceptProgress,
  DailySuggestion,
  PaceStatus,
} from '@/types/plannerTypes'

const DAY_MS = 24 * 60 * 60 * 1000

export function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0] || ''
}

function isoWeekday(date: Date): number {
  const day = date.getUTCDay()
  return day === 0 ? 7 : day
}

export function isStudyDay(date: Date, studyDays: number[]): boolean {
  return studyDays.includes(isoWeekday(date))
}

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
}

/**
 * Counts planned study days between two dates (inclusive), capped at 5 years
 * to guard against pathological ranges.
 */
export function countPlannedDays(
  from: Date,
  to: Date,
  studyDays: number[]
): number {
  let cursor = startOfUtcDay(from)
  const end = startOfUtcDay(to)
  let counted = 0
  let guard = 0

  while (cursor.getTime() <= end.getTime() && guard < 1830) {
    if (isStudyDay(cursor, studyDays)) counted++
    cursor = new Date(cursor.getTime() + DAY_MS)
    guard++
  }
  return counted
}

/**
 * Minutes the user should have studied from plan start up to and including
 * yesterday — today is excluded so an unfinished day never reads as "behind".
 */
export function computeExpectedMinutes(
  planStart: Date,
  now: Date,
  studyDays: number[],
  minutesPerDay: number
): number {
  const yesterday = new Date(startOfUtcDay(now).getTime() - DAY_MS)
  if (yesterday.getTime() < startOfUtcDay(planStart).getTime()) return 0
  return countPlannedDays(planStart, yesterday, studyDays) * minutesPerDay
}

export function countMissedStudyDays(
  planStart: Date,
  now: Date,
  studyDays: number[],
  activityDayKeys: Set<string>
): number {
  const yesterday = new Date(startOfUtcDay(now).getTime() - DAY_MS)
  let cursor = startOfUtcDay(planStart)
  let missed = 0
  let guard = 0

  while (cursor.getTime() <= yesterday.getTime() && guard < 1830) {
    if (isStudyDay(cursor, studyDays) && !activityDayKeys.has(toDateKey(cursor))) {
      missed++
    }
    cursor = new Date(cursor.getTime() + DAY_MS)
    guard++
  }
  return missed
}

export function computePaceStatus(
  expectedMinutes: number,
  actualMinutes: number,
  missedStudyDays: number
): PaceStatus {
  if (expectedMinutes <= 0) return 'on_track'
  const ratio = actualMinutes / expectedMinutes
  if (ratio >= 1.1) return 'ahead'
  if (ratio < 0.7 && missedStudyDays >= 2) return 'behind'
  return 'on_track'
}

/**
 * Consecutive planned study days with any activity, counting backwards.
 * Non-study days never break the streak; a still-empty today doesn't either.
 */
export function computeStreak(
  activityDayKeys: Set<string>,
  studyDays: number[],
  now: Date
): number {
  let cursor = startOfUtcDay(now)
  let streak = 0
  let guard = 0

  if (isStudyDay(cursor, studyDays) && activityDayKeys.has(toDateKey(cursor))) {
    streak++
  }
  cursor = new Date(cursor.getTime() - DAY_MS)

  while (guard < 366) {
    if (isStudyDay(cursor, studyDays)) {
      if (!activityDayKeys.has(toDateKey(cursor))) break
      streak++
    }
    cursor = new Date(cursor.getTime() - DAY_MS)
    guard++
  }
  return streak
}

export function activityDayKeys(entries: ActivityEntry[]): Set<string> {
  return new Set(entries.map((entry) => toDateKey(entry.date)))
}

export function sumMinutes(entries: ActivityEntry[]): number {
  return entries.reduce((total, entry) => total + entry.minutes, 0)
}

export function sumMinutesForDay(entries: ActivityEntry[], day: Date): number {
  const key = toDateKey(day)
  return sumMinutes(entries.filter((entry) => toDateKey(entry.date) === key))
}

/**
 * Attributes activity minutes to concepts: explicit conceptId wins, otherwise
 * the first concept matching the activity's categoryKey.
 */
export function attributeMinutes(
  concepts: Array<{ id: string; categoryKey: string | null }>,
  entries: ActivityEntry[]
): Map<string, { auto: number; manual: number }> {
  const byCategory = new Map<string, string>()
  concepts.forEach((concept) => {
    if (concept.categoryKey && !byCategory.has(concept.categoryKey)) {
      byCategory.set(concept.categoryKey, concept.id)
    }
  })

  const attributed = new Map<string, { auto: number; manual: number }>()
  concepts.forEach((concept) =>
    attributed.set(concept.id, { auto: 0, manual: 0 })
  )

  entries.forEach((entry) => {
    const conceptId =
      entry.conceptId ??
      (entry.categoryKey ? byCategory.get(entry.categoryKey) : undefined)
    if (!conceptId) return
    const bucket = attributed.get(conceptId)
    if (!bucket) return
    if (entry.conceptId) bucket.manual += entry.minutes
    else bucket.auto += entry.minutes
  })

  return attributed
}

/**
 * Picks today's suggested concept: uncompleted, prioritized by weakest test
 * accuracy in its category, then by lowest progress toward its target.
 */
export function pickDailySuggestion(
  concepts: ConceptProgress[],
  categoryAccuracy: Map<string, number>,
  minutesPerDay: number,
  todayMinutes: number
): DailySuggestion | null {
  const open = concepts.filter((concept) => !concept.completedAt)
  if (open.length === 0) return null

  const scored = open
    .map((concept) => {
      const accuracy = concept.categoryKey
        ? categoryAccuracy.get(concept.categoryKey) ?? 60
        : 60
      const progressRatio =
        concept.targetMinutes > 0
          ? (concept.autoMinutes + concept.manualMinutes) / concept.targetMinutes
          : 1
      return { concept, score: accuracy + progressRatio * 100 }
    })
    .sort(
      (a, b) => a.score - b.score || a.concept.sortOrder - b.concept.sortOrder
    )

  const picked = scored[0]!.concept
  return {
    conceptId: picked.id,
    label: picked.label,
    categoryKey: picked.categoryKey,
    remainingMinutesToday: Math.max(0, minutesPerDay - todayMinutes),
  }
}
