import { EMPTY_WOLFEK_QUESTION } from '@/constants/wolfekResponses'
import type { WolfekQuestionProps, WolfekQuestionState } from '@/types/wolfekResponseTypes'

export function resolveWolfekQuestionResult(
  result: WolfekQuestionState, submittedScope: string, currentScope: string,
  onSession?: WolfekQuestionProps['onSession'],
): WolfekQuestionState {
  if (result.session) onSession?.(result.session)
  return submittedScope === currentScope
    ? { ...result, values: { ...result.values, viewScope: submittedScope } } : EMPTY_WOLFEK_QUESTION
}
