import type { SelectOption } from '@/types/uiTypes'

export const QUESTION_COUNT_OPTIONS: SelectOption[] = [3, 5, 10, 15].map((count) => ({
  value: String(count),
  label: String(count),
}))
