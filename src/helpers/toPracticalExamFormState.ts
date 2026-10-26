import type { FormState } from '@/types/actionTypes'
import type { PracticalExamState } from '@/types/praktycznyTypes'

export function toPracticalExamFormState(state: PracticalExamState): FormState {
  return { status: state.status, message: state.message, timestamp: state.timestamp, fieldErrors: state.fieldErrors ?? {} }
}
