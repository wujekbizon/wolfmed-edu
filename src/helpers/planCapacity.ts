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
  const due = new Date(`${dueDate}T23:59:59Z`)
  if (Number.isNaN(due.getTime())) return 0
  return countPlannedDays(new Date(), due, studyDays) * minutesPerDay
}

/**
 * Per-concept minute share when spreading total capacity evenly, rounded down
 * to the nearest 5 and never below the minimum daily block.
 */
export function distributeMinutes(capacityMinutes: number, conceptCount: number): number {
  if (capacityMinutes <= 0 || conceptCount === 0) return MIN_MINUTES_PER_DAY
  return Math.max(MIN_MINUTES_PER_DAY, Math.floor(capacityMinutes / conceptCount / 5) * 5)
}
