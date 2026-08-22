const TWO_PI = Math.PI * 2

/** Signed delta in (-PI, PI], so orbiting picks the short way round. */
export function getShortestAngleDelta(from: number, to: number): number {
  const delta = (to - from) % TWO_PI
  if (delta > Math.PI) return delta - TWO_PI
  if (delta <= -Math.PI) return delta + TWO_PI
  return delta
}
