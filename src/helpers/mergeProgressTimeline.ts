import type { TimelinePoint } from '@/types/analyticsTypes'

// Study days and test days are separate series: a day can have learning-path
// minutes without a completed test, and such days must still reach the chart.
export function mergeProgressTimeline(
  tests: Array<{ date: string; avgScore: string; testsCount: number }>,
  studyMinutes: Array<{ date: string; minutes: number }>
): TimelinePoint[] {
  const byDate = new Map<string, TimelinePoint>()

  tests.forEach(({ date, avgScore, testsCount }) => {
    byDate.set(date, { date, avgScore, testsCount, studyMinutes: 0 })
  })

  studyMinutes.forEach(({ date, minutes }) => {
    const existing = byDate.get(date)
    if (existing) {
      existing.studyMinutes = minutes
      return
    }
    byDate.set(date, { date, avgScore: null, testsCount: 0, studyMinutes: minutes })
  })

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}
