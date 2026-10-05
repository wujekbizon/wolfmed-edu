import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'

export function getWolfekPreparedScope(practice?: WolfekPracticeReference | null): string {
  return JSON.stringify(practice ? {
    category: practice.category, questionId: practice.questionId,
    revision: practice.revision, selected: practice.selected ?? null,
  } : null)
}
