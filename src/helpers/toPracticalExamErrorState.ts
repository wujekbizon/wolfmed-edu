import { toFormState } from '@/helpers/toFormState'
import type { PracticalExamState } from '@/types/praktycznyTypes'

export function toPracticalExamErrorState(message: string): PracticalExamState {
  return { ...toFormState('ERROR', message), result: null }
}
