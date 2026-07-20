/**
 * Plan completion as a 0-100 percent: minutes attributed to concepts against
 * the sum of concept targets. Unattributed activity is excluded — it is shown
 * separately as "poza planem".
 */
export function planCompletionPercent(
  attributedMinutes: number,
  plannedTotalMinutes: number
): number {
  if (plannedTotalMinutes <= 0) return 0
  return Math.round(Math.min(1, attributedMinutes / plannedTotalMinutes) * 100)
}
