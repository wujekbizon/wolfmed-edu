import 'server-only'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { retrieveMemory } from './retrieve'
import { ASSEMBLY_TOKEN_BUDGET, CHARS_PER_TOKEN } from './config'
import type {
  MemoryHit,
  MemoryRecallTrace,
  MemoryTailResult,
} from '@/types/memoryRetrievalTypes'

export async function buildMemoryTail(
  userId: string,
  query: string
): Promise<MemoryTailResult> {
  try {
    const [factsExist, recentEpisodes] = await Promise.all([
      getActiveFacts(userId, 1),
      getRecentEpisodes(userId, { limit: 1 }),
    ])
    if (factsExist.length === 0 && recentEpisodes.length === 0) return { text: '' }

    const memory = await retrieveMemory(userId, query)
    const ranked = [...memory.facts, ...memory.episodes]
      .filter((hit) => hit.tier !== 'low')
      .sort((a, b) => b.score - a.score)
    const newest = recentEpisodes[0]
    if (newest && !memory.episodes.some((hit) => hit.id === newest.episodeId)) {
      ranked.push({
        id: newest.episodeId,
        kind: 'episode',
        selectionReason: 'recent',
        content: newest.summary,
        score: 0,
        tier: 'low',
      })
    }

    const selected: MemoryHit[] = []
    let used = 0
    const budget = ASSEMBLY_TOKEN_BUDGET * CHARS_PER_TOKEN
    for (const hit of ranked) {
      const lineLength = hit.content.length + 3
      if (used + lineLength > budget) continue
      selected.push(hit)
      used += lineLength
    }

    const facts = selected.filter((hit) => hit.kind === 'fact')
    const episodes = selected.filter((hit) => hit.kind === 'episode')
    const sections: string[] = []
    if (facts.length > 0) {
      sections.push(`FAKTY O UCZNIU:\n${facts.map((hit) => `- ${hit.content}`).join('\n')}`)
    }
    if (episodes.length > 0) {
      sections.push(`ISTOTNE WCZEŚNIEJSZE AKTYWNOŚCI:\n${episodes.map((hit) => `- ${hit.content}`).join('\n')}`)
    }

    const recall: MemoryRecallTrace = {
      facts: facts.map(({ id, score, tier, selectionReason }) => ({ id, score, tier, selectionReason })),
      episodes: episodes.map(({ id, score, tier, selectionReason }) => ({ id, score, tier, selectionReason })),
      modes: memory.modes,
    }
    return { text: sections.join('\n\n'), recall }
  } catch (error) {
    console.error('[memory] buildMemoryTail failed:', error)
    return { text: '' }
  }
}
