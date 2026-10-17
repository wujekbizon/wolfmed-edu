import type { WolfekFacts } from '@/types/wolfekResponseTypes'

export function getWolfekFact(facts: WolfekFacts, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) =>
    value && typeof value === 'object' && Object.hasOwn(value, key)
      ? (value as Record<string, unknown>)[key] : undefined, facts)
}
