export function clampPercent(ratio: number): number {
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100)
}
