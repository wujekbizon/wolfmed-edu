import type { SelectOption } from '@/types/uiTypes'

export function findOptionByPrefix(options: SelectOption[], prefix: string): number {
  const needle = prefix.toLowerCase()
  return options.findIndex((option) => option.label.toLowerCase().startsWith(needle))
}
