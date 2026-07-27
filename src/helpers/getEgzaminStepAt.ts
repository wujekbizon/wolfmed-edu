import { WYKONANIE_INDEX } from '@/constants/diagnozyEgzamin'
import type { DiagnozyExamStep } from '@/types/diagnozyTypes'

export function getEgzaminStepAt(
  steps: DiagnozyExamStep[],
  stepIndex: number
): DiagnozyExamStep | null {
  if (stepIndex === WYKONANIE_INDEX) return null
  return steps[stepIndex < WYKONANIE_INDEX ? stepIndex : stepIndex - 1] ?? null
}
