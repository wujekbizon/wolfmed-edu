import type { ExamResultScoreStatus } from '@/types/practicalExamResultTypes'

export function getExamResultScoreStatus(earned: number, max: number): ExamResultScoreStatus {
  if (max === 0) return 'unscored'
  if (earned >= max) return 'full'
  return earned > 0 ? 'partial' : 'none'
}
