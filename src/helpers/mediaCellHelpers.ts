export function seededBars(seed: string, count = 30): number[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return Array.from({ length: count }, (_, i) => {
    const n = Math.sin((hash + i) * 9301 + 49297) * 233280
    const pct = n - Math.floor(n)
    return 20 + Math.round(pct * 60) // 20–80% height
  })
}
