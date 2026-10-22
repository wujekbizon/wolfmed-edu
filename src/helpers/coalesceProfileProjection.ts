import { setImmediate as yieldTurn } from 'node:timers/promises'
import type { PendingProfileProjection, ProfileProjectionUpdate } from '@/types/practiceProfileTypes'

export function coalesceProfileProjection(update: ProfileProjectionUpdate): ProfileProjectionUpdate {
  const pending = new Map<string, PendingProfileProjection>()
  return (user, category) => {
    const key = JSON.stringify([user, category])
    const existing = pending.get(key)
    if (existing) {
      existing.generation++
      return existing.promise
    }
    const entry: PendingProfileProjection = { generation: 0, promise: Promise.resolve(false) }
    pending.set(key, entry)
    entry.promise = (async () => {
      try {
        await yieldTurn()
        let generation: number
        do {
          generation = entry.generation
          if (!await update(user, category)) return false
        } while (generation !== entry.generation)
        return true
      } finally {
        pending.delete(key)
      }
    })()
    return entry.promise
  }
}
