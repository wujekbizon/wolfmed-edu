import 'server-only'
import { getPreferencesMap } from './stores/preferences'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { retrieveMemory } from './retrieve'
import { renderMemoryPreferences } from '@/helpers/renderMemoryPreferences'
import type { SelfStateContextResult } from '@/types/memoryTypes'

export async function buildSelfStateContext(
  userId: string,
  query: string
): Promise<SelfStateContextResult> {
  try {
    const [memory, preferences] = await Promise.all([
      retrieveMemory(userId, query, { factLimit: 20, episodeLimit: 8 }),
      getPreferencesMap(userId),
    ])
    let facts = memory.facts.filter((hit) => hit.tier !== 'low')
    let episodes = memory.episodes.filter((hit) => hit.tier !== 'low')

    if (facts.length === 0 && episodes.length === 0) {
      const [fallbackFacts, fallbackEpisodes] = await Promise.all([
        getActiveFacts(userId, 40),
        getRecentEpisodes(userId, { limit: 5 }),
      ])
      facts = fallbackFacts.map((fact) => ({
        id: fact.factId,
        kind: 'fact',
        selectionReason: 'fallback',
        content: fact.content,
        score: 0,
        tier: 'low',
      }))
      episodes = fallbackEpisodes.map((episode) => ({
        id: episode.episodeId,
        kind: 'episode',
        selectionReason: 'fallback',
        content: episode.summary,
        score: 0,
        tier: 'low',
      }))
    }
    if (facts.length === 0 && episodes.length === 0) return { status: 'empty' }

    const sections: string[] = []
    if (facts.length > 0) {
      sections.push(`FAKTY O UCZNIU:\n${facts.map((fact) => `- ${fact.content}`).join('\n')}`)
    }
    const preferenceLines = renderMemoryPreferences(preferences)
    if (preferenceLines.length > 0) {
      sections.push(`PREFERENCJE:\n${preferenceLines.join('\n')}`)
    }
    if (episodes.length > 0) {
      sections.push(`ISTOTNE AKTYWNOŚCI:\n${episodes.map((episode) => `- ${episode.content}`).join('\n')}`)
    }

    return {
      status: 'ready',
      context: sections.join('\n\n'),
      counts: { facts: facts.length, preferences: preferenceLines.length, episodes: episodes.length },
      recall: {
        facts: facts.map(({ id, score, tier, selectionReason }) => ({ id, score, tier, selectionReason })),
        episodes: episodes.map(({ id, score, tier, selectionReason }) => ({ id, score, tier, selectionReason })),
        modes: memory.modes,
      },
    }
  } catch (error) {
    console.error('[memory] buildSelfStateContext failed:', error)
    return { status: 'unavailable' }
  }
}
