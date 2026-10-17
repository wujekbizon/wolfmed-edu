import { getWolfekFact } from './getWolfekFact'
import type { WolfekFacts } from '@/types/wolfekResponseTypes'

export function renderWolfekTemplate(template: string, facts: WolfekFacts): string | null {
  let missing = false
  const text = template.replace(/\{\{([a-zA-Z0-9_.]+)\}\}/g, (_, path: string) => {
    const value = getWolfekFact(facts, path)
    if (typeof value !== 'string' && typeof value !== 'number') { missing = true; return '' }
    return String(value)
  })
  return missing || text.includes('{{') ? null : text
}
