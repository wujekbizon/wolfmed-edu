import 'server-only'
import { getActivePolicies } from './stores/policies'
import { getPreferencesMap } from './stores/preferences'
import { getActiveFacts } from './stores/facts'
import { getRecentEpisodes } from './stores/episodes'
import { retrieveFacts } from './retrieve'
import { ASSEMBLY_TOKEN_BUDGET, CHARS_PER_TOKEN } from './config'
import { preferenceLabel, preferenceValueLabel } from '@/constants/memoryPreferences'
import type { MemPolicy } from '@/server/db/memory-schema'
import type { SelfStateContextResult } from '@/types/memoryTypes'

// ── Path A: static, exact, exhaustive — no ranking ──────────────────────────
// Builds the prompt-cache-friendly memory block that goes into the tutor's
// system instruction: active policies (same for everyone) then this student's
// preferences. This is the M1 slice of assembly; M3 adds the ranked volatile
// tail (facts/episodes) and the token budget.
//
// FAIL-SAFE BY DESIGN: any failure (tables not migrated yet, DB blip) returns
// an empty string so the tutor degrades to its current behavior and never
// errors. That is what makes wiring this in safe before db:push has run.

function renderPolicy(policy: MemPolicy): string | null {
  const value = policy.policyValue as Record<string, unknown>
  switch (policy.policyKey) {
    case 'answer_grounding':
      return value.require_corpus_citation
        ? 'Opieraj każdą odpowiedź na źródłach z bazy wiedzy i wskazuj dokument źródłowy. Jeśli informacji nie ma w bazie, powiedz to wprost — nie zmyślaj.'
        : null
    case 'medical_disclaimer': {
      const on = Array.isArray(value.inject_on) ? (value.inject_on as string[]).join(', ') : ''
      return `Przy tematach dotyczących ${on || 'leczenia'} dodaj krótkie zastrzeżenie, że treść ma charakter edukacyjny i nie zastępuje konsultacji z lekarzem.`
    }
    case 'answer_language':
      return 'Odpowiadaj wyłącznie po polsku, poprawną terminologią medyczną.'
    default:
      return `${policy.policyKey}: ${JSON.stringify(policy.policyValue)}`
  }
}

function renderPreferences(prefs: Record<string, unknown>): string[] {
  const lines: string[] = []
  for (const [key, raw] of Object.entries(prefs)) {
    const value = typeof raw === 'string' ? raw : String(raw ?? '')
    if (!value || value === 'brak') continue
    lines.push(`- ${preferenceLabel(key)}: ${preferenceValueLabel(key, value)}`)
  }
  return lines
}

export async function buildStaticPrefix(userId: string): Promise<string> {
  try {
    const [policies, prefs] = await Promise.all([
      getActivePolicies(),
      getPreferencesMap(userId),
    ])

    const sections: string[] = []

    const policyLines = policies
      .map(renderPolicy)
      .filter((line): line is string => Boolean(line))
      .map((line) => `- ${line}`)
    if (policyLines.length > 0) {
      sections.push(`ZASADY (obowiązujące polityki):\n${policyLines.join('\n')}`)
    }

    const prefLines = renderPreferences(prefs)
    if (prefLines.length > 0) {
      sections.push(`PREFERENCJE UCZNIA:\n${prefLines.join('\n')}`)
    }

    return sections.join('\n\n')
  } catch (error) {
    console.error('[memory] buildStaticPrefix failed, degrading to no memory:', error)
    return ''
  }
}

// ── Path B: ranked volatile tail (M3) ───────────────────────────────────────
// Retrieved facts + recent episodes for the tutor's volatile prompt section.
// Token-budgeted: reserved nothing here, fill to budget dropping whole items
// (never truncate a record mid-way). Fail-safe → '' so the tutor never breaks.
export async function buildMemoryTail(userId: string, query: string): Promise<string> {
  try {
    // Skip the query embedding entirely when the student has no facts yet — no
    // point paying an embedding call (and quota) to search an empty set.
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
      if (hit.tier === 'low') continue // only high/standard confidence into the prompt
      const line = `- ${hit.content}`
      if (used + line.length > budgetChars) break
      factLines.push(line)
      used += line.length
    }
    if (factLines.length > 0) sections.push(`WIEDZA O UCZNIU:\n${factLines.join('\n')}`)

    const epLines: string[] = []
    for (const ep of episodes) {
      const line = `- ${ep.summary}`
      if (used + line.length > budgetChars) break
      epLines.push(line)
      used += line.length
    }
    if (epLines.length > 0) sections.push(`OSTATNIE AKTYWNOŚCI UCZNIA:\n${epLines.join('\n')}`)

    return sections.join('\n\n')
  } catch (error) {
    console.error('[memory] buildMemoryTail failed:', error)
    return ''
  }
}

export async function buildSelfStateContext(userId: string): Promise<SelfStateContextResult> {
  try {
    const [facts, prefs, episodes] = await Promise.all([
      getActiveFacts(userId, 40),
      getPreferencesMap(userId),
      getRecentEpisodes(userId, { limit: 5 }),
    ])

    const sections: string[] = []

    if (facts.length > 0) {
      sections.push(`FAKTY O UCZNIU:\n${facts.map((f) => `- ${f.content}`).join('\n')}`)
    }
    const prefLines = renderPreferences(prefs)
    if (prefLines.length > 0) sections.push(`PREFERENCJE:\n${prefLines.join('\n')}`)
    if (episodes.length > 0) {
      sections.push(`OSTATNIE AKTYWNOŚCI:\n${episodes.map((e) => `- ${e.summary}`).join('\n')}`)
    }

    const context = sections.join('\n\n')
    return context ? { status: 'ready', context } : { status: 'empty' }
  } catch (error) {
    console.error('[memory] buildSelfStateContext failed:', error)
    return { status: 'unavailable' }
  }
}
