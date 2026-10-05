import type { WolfekFacts } from '@/types/wolfekResponseTypes'

export function getWolfekDecisionFacts(facts: WolfekFacts): WolfekFacts {
  const compact: WolfekFacts = {}
  for (const [key, value] of Object.entries(facts)) {
    if (value === null || typeof value === 'boolean' || typeof value === 'number') compact[key] = value
    else if (typeof value === 'string' && ['status', 'title', 'questionText', 'hintSourceLabel'].includes(key)) compact[key] = value
    else if (value && typeof value === 'object' && !Array.isArray(value)) {
      const child = getWolfekDecisionFacts(value as WolfekFacts)
      if (Object.keys(child).length) compact[key] = child
    }
  }
  return compact
}
