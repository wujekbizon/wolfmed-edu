import { WOLFEK_COVERAGE_LEVELS } from '@/constants/wolfekJudgments'

export function buildWolfekJudgments(question: string, criteria: Record<string, null>) {
  return {
    response: { type: 'choice',
      instructions: `Which state.responseOptions entry directly answers ${question}? Read each entry's covers and text, applying state.rules. Return its ID.`,
      criteria },
    needs_clarification: { type: 'noul',
      instructions: `Does ${question} need missing user detail (goal, course or test)? A failed lookup is not user ambiguity.`,
      criteria: { true: 'A specific missing user detail is required.', false: 'Specified enough, or facts are unavailable/out of scope.' } },
    answer_coverage: { type: 'score',
      instructions: `How completely can the eligible state.responseOptions answer ${question}? Judge the bank independently, not another answer.`,
      criteria: WOLFEK_COVERAGE_LEVELS },
  }
}
