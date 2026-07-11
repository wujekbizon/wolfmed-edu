/**
 * Format a minute count as a human-readable Polish duration, e.g.
 * 30 → "30 min", 60 → "1 h", 90 → "1 h 30 min".
 */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
}
