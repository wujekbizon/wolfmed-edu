import { countPlannedDays } from '@/server/planner/engine'
import { MIN_MINUTES_PER_DAY } from '@/constants/planner'

/**
 * Total minutes a learner can realistically study before the due date, given
 * their weekly study days and minutes/day. Returns 0 for an invalid/empty date.
 */
export function computePlanCapacity(
  dueDate: string,
  studyDays: number[],
  minutesPerDay: number
): number {
  if (!dueDate || studyDays.length === 0) return 0
  // Noon UTC maps to the same calendar date in the planner's timezone,
  // avoiding off-by-one-day drift around midnight.
  const due = new Date(`${dueDate}T12:00:00Z`)
  if (Number.isNaN(due.getTime())) return 0
  return countPlannedDays(new Date(), due, studyDays) * minutesPerDay
}

/**
 * Per-concept minute share when spreading a total evenly, rounded down to the
 * nearest 5 and never below the minimum daily block.
 */
export function distributeMinutes(totalMinutes: number, conceptCount: number): number {
  if (totalMinutes <= 0 || conceptCount === 0) return MIN_MINUTES_PER_DAY
  return Math.max(MIN_MINUTES_PER_DAY, Math.floor(totalMinutes / conceptCount / 5) * 5)
}
