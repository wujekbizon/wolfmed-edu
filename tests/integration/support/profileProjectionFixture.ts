import assert from 'node:assert/strict'
import type { ProfileEvent, ProfileProjectionState } from './profileProjectionTypes'

export const projectionUser = 'synthetic-user'
export const projectionCategory = 'opiekun-medyczny'
export const projectionKey = (user: string, category: string) => `${user}:practice:${category}`

export function profileEvent(index: number, userId = projectionUser, category = projectionCategory): ProfileEvent {
  const kinds = ['answer_submitted', 'hint_opened', 'answer_revealed', 'comparison_opened', 'tutor_answered']
  return { userId, category, eventId: `event-${userId}-${category}-${index}`, questionId: `question-${index}`,
    revision: 'v1', kind: kinds[index % kinds.length]!,
    at: new Date(Date.now() - (1_000 - index) * 1_000),
    payload: { attempts: 1, correct: index % 2 === 0, assisted: false } }
}

export function createProjectionState(): ProfileProjectionState {
  return { events: Array.from({ length: 120 }, (_, i) => profileEvent(i)), facts: new Map(), episodes: new Map(),
    metrics: { transactions: 0, openTransactions: 0, peakOpenTransactions: 0,
      poolWaits: 0, peakPoolQueue: 0, lockWaits: 0, peakLockQueue: 0,
      historyReads: 0, historyRows: 0, profileReads: 0, factWrites: 0, episodeWrites: 0 } }
}

export function verifyFinalProjection(state: ProfileProjectionState, user = projectionUser, category = projectionCategory) {
  const rows = state.events.filter(row => row.userId === user && row.category === category)
    .sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 120)
  const fact = state.facts.get(projectionKey(user, category))
  assert.ok(fact)
  const expected = { lastEventId: rows[0]!.eventId, lastAt: rows[0]!.at.toISOString(), cards: rows.length,
    firstCorrect: rows.filter(row => row.kind === 'answer_submitted' && row.payload.correct).length,
    firstWrong: rows.filter(row => row.kind === 'answer_submitted' && !row.payload.correct).length,
    hints: rows.filter(row => row.kind === 'hint_opened').length,
    reveals: rows.filter(row => row.kind === 'answer_revealed').length,
    comparisons: rows.filter(row => row.kind === 'comparison_opened').length,
    tutorResponses: rows.filter(row => row.kind === 'tutor_answered').length, retries: 0 }
  for (const [key, value] of Object.entries(expected)) assert.equal(fact.metadata?.[key], value, key)
  assert.equal(fact.userId, user)
  assert.equal(fact.embedding, null)
  assert.ok(fact.content.includes(String(rows.length)))
  const episode = [...state.episodes.values()].find(row => row.userId === user && row.title.endsWith(category))
  assert.ok(episode)
  const artifacts = episode.artifacts as Record<string, unknown>
  for (const [key, value] of Object.entries(expected)) {
    if (key !== 'lastAt') assert.equal(artifacts[key], value, `episode.${key}`)
  }
  return expected
}
