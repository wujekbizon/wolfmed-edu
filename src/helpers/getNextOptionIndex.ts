export function getNextOptionIndex(
  current: number,
  step: number,
  total: number,
  fallback: number
): number {
  if (total === 0) return -1
  const from = current === -1 ? fallback : current
  return (from + step + total) % total
}
