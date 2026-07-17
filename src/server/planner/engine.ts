import type {
  ActivityEntry,
  ConceptProgress,
  DailySuggestion,
  PaceStatus,
} from '@/types/plannerTypes'

const DAY_MS = 24 * 60 * 60 * 1000

// All day math runs in the learners' timezone: an activity at 00:30 in Warsaw
// belongs to that Warsaw date, not the previous UTC one.
const PLANNER_TIMEZONE = 'Europe/Warsaw'

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: PLANNER_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function toDateKey(date: Date): string {
  return dateKeyFormatter.format(date)
}

/**
 * Anchors a moment to 12:00 UTC of its Warsaw calendar date. Noon stays on the
 * same calendar date when stepping by whole days across DST changes, so these
 * anchors are safe to iterate with DAY_MS.
 */
function dayAnchor(date: Date): Date {
  const [year, month, day] = toDateKey(date).split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day!, 12))
}

function isoWeekday(date: Date): number {
  const day = dayAnchor(date).getUTCDay()
  return day === 0 ? 7 : day
}

export function isStudyDay(date: Date, studyDays: number[]): boolean {
  return studyDays.includes(isoWeekday(date))
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
  let cursor = dayAnchor(from)
  const end = dayAnchor(to)
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
  const yesterday = new Date(dayAnchor(now).getTime() - DAY_MS)
  if (yesterday.getTime() < dayAnchor(planStart).getTime()) return 0
  return countPlannedDays(planStart, yesterday, studyDays) * minutesPerDay
}

export function countMissedStudyDays(
  planStart: Date,
  now: Date,
  studyDays: number[],
  activityDayKeys: Set<string>
): number {
  const yesterday = new Date(dayAnchor(now).getTime() - DAY_MS)
  let cursor = dayAnchor(planStart)
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
  let cursor = dayAnchor(now)
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

export interface AttributableConcept {
  id: string
  categoryKey: string | null
  procedureId: string | null
  targetMinutes: number
  sortOrder: number
  completedAt: Date | null
}

type MinuteBuckets = Map<string, { auto: number; manual: number }>

function groupConcepts(
  concepts: AttributableConcept[],
  key: 'categoryKey' | 'procedureId'
): Map<string, AttributableConcept[]> {
  const groups = new Map<string, AttributableConcept[]>()
  concepts.forEach((concept) => {
    const value = concept[key]
    if (!value) return
    const group = groups.get(value) ?? []
    group.push(concept)
    groups.set(value, group)
  })
  return groups
}

/**
 * Pours minutes into a group's concepts: open concepts first (by sortOrder),
 * each filled up to its target; overflow lands on the group's last concept so
 * no matched minutes are ever lost.
 */
function pourIntoGroup(
  minutes: number,
  group: AttributableConcept[],
  attributed: MinuteBuckets
): void {
  const bySortOrder = (a: AttributableConcept, b: AttributableConcept) =>
    a.sortOrder - b.sortOrder
  const ordered = [
    ...group.filter((concept) => !concept.completedAt).sort(bySortOrder),
    ...group.filter((concept) => concept.completedAt).sort(bySortOrder),
  ]

  let remaining = minutes
  for (const concept of ordered) {
    if (remaining <= 0) break
    const bucket = attributed.get(concept.id)!
    const room = Math.max(0, concept.targetMinutes - bucket.auto - bucket.manual)
    const poured = Math.min(room, remaining)
    bucket.auto += poured
    remaining -= poured
  }

  if (remaining > 0) {
    const last = ordered[ordered.length - 1]!
    attributed.get(last.id)!.auto += remaining
  }
}

/**
 * Attributes activity minutes to concepts. Matching priority per entry:
 * explicit conceptId (manual) → procedureId (auto) → categoryKey (auto).
 * Matched minutes waterfall across the group's concepts instead of piling
 * onto the first one.
 */
export function attributeMinutes(
  concepts: AttributableConcept[],
  entries: ActivityEntry[]
): MinuteBuckets {
  const attributed: MinuteBuckets = new Map()
  concepts.forEach((concept) =>
    attributed.set(concept.id, { auto: 0, manual: 0 })
  )

  const byProcedure = groupConcepts(concepts, 'procedureId')
  const byCategory = groupConcepts(concepts, 'categoryKey')

  const autoByProcedure = new Map<string, number>()
  const autoByCategory = new Map<string, number>()

  entries.forEach((entry) => {
    if (entry.conceptId) {
      const bucket = attributed.get(entry.conceptId)
      if (bucket) bucket.manual += entry.minutes
      return
    }
    if (entry.procedureId && byProcedure.has(entry.procedureId)) {
      autoByProcedure.set(
        entry.procedureId,
        (autoByProcedure.get(entry.procedureId) ?? 0) + entry.minutes
      )
      return
    }
    if (entry.categoryKey && byCategory.has(entry.categoryKey)) {
      autoByCategory.set(
        entry.categoryKey,
        (autoByCategory.get(entry.categoryKey) ?? 0) + entry.minutes
      )
    }
  })

  autoByProcedure.forEach((minutes, procedureId) =>
    pourIntoGroup(minutes, byProcedure.get(procedureId)!, attributed)
  )
  autoByCategory.forEach((minutes, categoryKey) =>
    pourIntoGroup(minutes, byCategory.get(categoryKey)!, attributed)
  )

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
    procedureId: picked.procedureId,
    remainingMinutesToday: Math.max(0, minutesPerDay - todayMinutes),
  }
}
