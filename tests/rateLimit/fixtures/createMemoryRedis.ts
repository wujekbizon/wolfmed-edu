import assert from 'node:assert/strict'
import type { TestRedis } from '../../support/rateLimitTypes'

export function createMemoryRedis(): TestRedis {
  const sets = new Map<string, Map<string, number>>()
  const get = (key: string) => {
    if (!sets.has(key)) sets.set(key, new Map())
    return sets.get(key)!
  }
  const trim = (key: string, min: number, max: number) => {
    for (const [member, score] of get(key)) {
      if (score >= min && score <= max) get(key).delete(member)
    }
  }
  return {
    zremrangebyscore: async (key, min, max) => trim(key, min, max),
    zcard: async key => get(key).size,
    zadd: async (key, entry) => { get(key).set(entry.member, entry.score) },
    expire: async () => 1,
    eval: async (script, keys, args) => {
      assert.match(script, /ZREMRANGEBYSCORE/)
      assert.match(script, /ZCARD/)
      assert.match(script, /ZADD/)
      assert.match(script, /EXPIRE/)
      assert.equal(keys.length, 1)
      const key = keys[0]!
      trim(key, 0, Number(args[0]))
      const count = get(key).size
      get(key).set(String(args[2]), Number(args[1]))
      return count
    },
  }
}
