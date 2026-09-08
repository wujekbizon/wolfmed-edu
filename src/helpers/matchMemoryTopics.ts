import { normalizeMemoryTerms } from './normalizeMemoryTerms'
import { MEMORY_GENERIC_TOPIC_PREFIXES } from '@/constants/memoryRetrieval'
import type { MemoryTopic } from '@/types/memoryRetrievalTypes'

export function matchMemoryTopics(query: string, catalog: MemoryTopic[]): MemoryTopic[] {
  const words = normalizeMemoryTerms(query)
  const matches = new Map<string, MemoryTopic>()
  for (const topic of catalog) {
    const labels = normalizeMemoryTerms(topic.label)
    if (!labels.length) continue
    const matched = labels.filter((label) => words.some((word) => {
      if (word === label && word.length >= 4) return true
      let prefix = 0
      while (prefix < Math.min(word.length, label.length) && word[prefix] === label[prefix]) prefix++
      return prefix >= 6 && prefix / Math.max(word.length, label.length) >= 0.75
    }))
    if (matched.length >= Math.min(2, labels.length) ||
      matched.some((word) => word.length >= 6 &&
        !MEMORY_GENERIC_TOPIC_PREFIXES.some((prefix) => word.startsWith(prefix)) &&
        catalog.every((other) =>
        other.key === topic.key || !normalizeMemoryTerms(other.label).includes(word)))) {
      matches.set(topic.key, topic)
    }
  }
  return [...matches.values()]
}
