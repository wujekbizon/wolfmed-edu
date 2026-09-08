import { ASSEMBLY_TOKEN_BUDGET, CHARS_PER_TOKEN } from '@/server/memory/config'
import { MEMORY_ITEM_CHAR_LIMIT, MEMORY_EPISODES_PER_TOPIC, MEMORY_FACT_BUDGET_SHARE } from '@/constants/memoryRetrieval'
import type { MemoryRecallResult, MemoryRecallTrace, MemoryHit } from '@/types/memoryRetrievalTypes'

export function assembleMemoryContext(memory: MemoryRecallResult, preferences: string[] = []) {
  const header = preferences.length ? `PREFERENCJE:\n${preferences.join('\n')}\n\n` : ''
  const selected: MemoryHit[] = []
  const decisions = new Map<string, 'budget' | 'diversity'>()
  const perTopic = new Map<string, number>()
  const lines: string[] = []
  let used = header.length
  let factChars = 0
  const budget = ASSEMBLY_TOKEN_BUDGET * CHARS_PER_TOKEN
  const factBudget = memory.episodes.length ? (budget - used) * MEMORY_FACT_BUDGET_SHARE : budget - used
  const ranked = [...memory.facts, ...memory.episodes].sort((a, b) =>
    Number(b.kind === 'fact') - Number(a.kind === 'fact') ||
    b.score - a.score || b.recordedAt.getTime() - a.recordedAt.getTime())
  for (const hit of ranked) {
    const key = `${hit.kind}:${hit.id}`
    const group = hit.topicKey ?? 'other'
    if (hit.kind === 'episode' && !memory.topics.length &&
      (perTopic.get(group) ?? 0) >= MEMORY_EPISODES_PER_TOPIC) {
      decisions.set(key, 'diversity')
      continue
    }
    const type = hit.kind === 'fact' ? 'ZAPISANY FAKT / AGREGAT' : 'POJEDYNCZA AKTYWNOŚĆ'
    const line = `- [${type}; trafność: ${hit.tier}; data zapisu: ${hit.recordedAt.toISOString()}] ${hit.content}\n`
    if (line.length > MEMORY_ITEM_CHAR_LIMIT || used + line.length > budget ||
      (hit.kind === 'fact' && factChars + line.length > factBudget)) {
      decisions.set(key, 'budget')
      continue
    }
    selected.push(hit)
    lines.push(line)
    used += line.length
    if (hit.kind === 'fact') factChars += line.length
    if (hit.kind === 'episode') perTopic.set(group, (perTopic.get(group) ?? 0) + 1)
  }
  const traceHit = ({ id, score, tier, selectionReason, recordedAt, topicKey }: MemoryHit) =>
    ({ id, score, tier, selectionReason, recordedAt, topicKey })
  const recall: MemoryRecallTrace = {
    topics: memory.topics, modes: memory.modes,
    facts: selected.filter((hit) => hit.kind === 'fact').map(traceHit),
    episodes: selected.filter((hit) => hit.kind === 'episode').map(traceHit),
    candidates: memory.candidates.map((candidate) => ({
      ...candidate,
      decision: decisions.get(`${candidate.kind}:${candidate.id}`) ?? candidate.decision,
    })),
  }
  return { text: header + lines.join(''), recall }
}
