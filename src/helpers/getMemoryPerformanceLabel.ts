import {
  MEMORY_STRONG_PERCENT,
  MEMORY_WEAK_PERCENT,
} from '@/constants/memoryPerformance'

export function getMemoryPerformanceLabel(percent: number): string {
  if (percent < MEMORY_WEAK_PERCENT) return 'wynik wymagający poprawy'
  if (percent >= MEMORY_STRONG_PERCENT) return 'dobry wynik'
  return 'przeciętny wynik'
}
