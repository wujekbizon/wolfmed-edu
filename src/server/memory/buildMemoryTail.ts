import 'server-only'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { retrieveFacts } from './retrieve'
import { ASSEMBLY_TOKEN_BUDGET, CHARS_PER_TOKEN } from './config'

export async function buildMemoryTail(userId: string, query: string): Promise<string> {
  try {
    const anyFact = await getActiveFacts(userId, 1)
    if (anyFact.length === 0) {
      const episodesOnly = await getRecentEpisodes(userId, { limit: 3 })
      if (episodesOnly.length === 0) return ''
      return `OSTATNIE AKTYWNOŚCI UCZNIA:\n${episodesOnly.map((e) => `- ${e.summary}`).join('\n')}`
    }

    const budgetChars = ASSEMBLY_TOKEN_BUDGET * CHARS_PER_TOKEN
    const [factResult, episodes] = await Promise.all([
      retrieveFacts(userId, query, 8),
      getRecentEpisodes(userId, { limit: 3 }),
    ])
    const sections: string[] = []
    let used = 0
    const factLines: string[] = []
    for (const hit of factResult.hits) {
      if (hit.tier === 'low') continue
      const line = `- ${hit.content}`
      if (used + line.length > budgetChars) break
      factLines.push(line)
      used += line.length
    }
    if (factLines.length > 0) sections.push(`WIEDZA O UCZNIU:\n${factLines.join('\n')}`)

    const episodeLines: string[] = []
    for (const episode of episodes) {
      const line = `- ${episode.summary}`
      if (used + line.length > budgetChars) break
      episodeLines.push(line)
      used += line.length
    }
    if (episodeLines.length > 0) {
      sections.push(`OSTATNIE AKTYWNOŚCI UCZNIA:\n${episodeLines.join('\n')}`)
    }
    return sections.join('\n\n')
  } catch (error) {
    console.error('[memory] buildMemoryTail failed:', error)
    return ''
  }
}
