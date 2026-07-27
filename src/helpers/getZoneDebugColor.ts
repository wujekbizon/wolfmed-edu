const DEBUG_PALETTE = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#a3e635',
]

/** Stable per-zone colour so overlapping colliders stay distinguishable. */
export function getZoneDebugColor(zone: string): string {
  let hash = 0
  for (let i = 0; i < zone.length; i++) {
    hash = (hash * 31 + zone.charCodeAt(i)) % 100000
  }
  return DEBUG_PALETTE[hash % DEBUG_PALETTE.length]!
}
