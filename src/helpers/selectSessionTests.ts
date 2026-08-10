import type { Test } from '@/types/dataTypes'

function hashSeed(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRandom(seed: number) {
  return () => {
    seed += 0x6d2b79f5
    let value = seed
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: T[], seed: string) {
  const result = [...values]
  const random = seededRandom(hashSeed(seed))

  for (let index = result.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    const current = result[index]!
    result[index] = result[target]!
    result[target] = current
  }

  return result
}

export function selectSessionTests(tests: Test[], count: number, sessionId: string) {
  const selected = shuffle(
    [...tests].sort((left, right) => left.id.localeCompare(right.id)),
    `${sessionId}:questions`
  ).slice(0, Math.min(count, tests.length))

  return selected.map((test) => ({
    ...test,
    data: {
      ...test.data,
      answers: shuffle(test.data.answers, `${sessionId}:${test.id}:answers`),
    },
  }))
}
