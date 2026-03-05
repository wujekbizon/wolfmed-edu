export interface MediaCellContent {
  sourceType: 'audio' | 'video'
  title: string
  url: string
  lectureId?: string
  transcript?: string
}

export const SPEED_OPTIONS = [0.75, 1, 1.5, 2] as const
export type SpeedOption = typeof SPEED_OPTIONS[number]

export function seededBars(seed: string, count = 30): number[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return Array.from({ length: count }, (_, i) => {
    const n = Math.sin((hash + i) * 9301 + 49297) * 233280
    const pct = n - Math.floor(n)
    return 20 + Math.round(pct * 60)
  })
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
