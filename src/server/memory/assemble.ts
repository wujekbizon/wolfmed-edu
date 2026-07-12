import 'server-only'
import { getActivePolicies } from './stores/policies'
import { getPreferencesMap } from './stores/preferences'
import { preferenceLabel, preferenceValueLabel } from '@/constants/memoryPreferences'
import type { MemPolicy } from '@/server/db/memory-schema'

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
