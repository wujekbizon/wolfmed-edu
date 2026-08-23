import 'server-only'
import { getPreferencesMap } from './stores/preferences'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { renderMemoryPreferences } from '@/helpers/renderMemoryPreferences'
import type { SelfStateContextResult } from '@/types/memoryTypes'

export async function buildSelfStateContext(
  userId: string
): Promise<SelfStateContextResult> {
  try {
    const [facts, preferences, episodes] = await Promise.all([
      getActiveFacts(userId, 40),
      getPreferencesMap(userId),
      getRecentEpisodes(userId, { limit: 5 }),
    ])
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
      sections.push(
        `OSTATNIE AKTYWNOŚCI:\n${episodes.map((episode) => `- ${episode.summary}`).join('\n')}`
      )
    }
    return {
      status: 'ready',
      context: sections.join('\n\n'),
      counts: {
        facts: facts.length,
        preferences: preferenceLines.length,
        episodes: episodes.length,
      },
    }
  } catch (error) {
    console.error('[memory] buildSelfStateContext failed:', error)
    return { status: 'unavailable' }
  }
}
