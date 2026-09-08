import { MEMORY_QUERY_FILLER } from '@/constants/memoryRetrieval'

export function getMemoryQueryWords(query: string): string[] {
  return [...new Set(query.toLowerCase().match(/[\p{L}]+/gu) ?? [])]
    .filter((word) => word.length > 3 && !MEMORY_QUERY_FILLER.has(word))
    .slice(0, 12)
}
