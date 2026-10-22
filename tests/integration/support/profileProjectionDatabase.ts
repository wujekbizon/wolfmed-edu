import assert from 'node:assert/strict'
import { setImmediate as yieldTurn } from 'node:timers/promises'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import { learningPracticeEvents } from '@/server/db/schema'
import { memFacts } from '@/server/db/memory-schema'
import { projectionKey } from './profileProjectionFixture'
import type { ProfileProjectionState } from './profileProjectionTypes'

export function createProjectionDatabase(state: ProfileProjectionState) {
  let open = 0
  const poolQueue: Array<() => void> = []
  const locks = new Map<string, Array<() => void>>()
  const dialect = new PgDialect()
  const db = { async transaction<T>(callback: (tx: unknown) => Promise<T>): Promise<T> {
    state.metrics.transactions++
    if (open === 3) {
      state.metrics.poolWaits++
      await new Promise<void>(resolve => {
        poolQueue.push(resolve)
        state.metrics.peakPoolQueue = Math.max(state.metrics.peakPoolQueue, poolQueue.length)
      })
    } else open++
    state.metrics.openTransactions++
    state.metrics.peakOpenTransactions = Math.max(state.metrics.peakOpenTransactions, state.metrics.openTransactions)
    let held: string | undefined
    const tx = {
      async execute(expression: SQL) {
        const query = dialect.sqlToQuery(expression)
        assert.match(query.sql, /pg_advisory_xact_lock/)
        const key = String(query.params[0])
        if (locks.has(key)) {
          state.metrics.lockWaits++
          await new Promise<void>(resolve => {
            const queue = locks.get(key)!
            queue.push(resolve)
            state.metrics.peakLockQueue = Math.max(state.metrics.peakLockQueue, queue.length)
          })
        } else locks.set(key, [])
        held = key
        await yieldTurn()
      },
      select() {
        let table: unknown
        let params: unknown[] = []
        const chain = {
          from(value: unknown) { table = value; return chain },
          innerJoin() { return chain },
          where(expression: SQL) { params = dialect.sqlToQuery(expression).params; return chain },
          orderBy() { return chain },
          async limit(limit: number) {
            await yieldTurn()
            assert.ok(held)
            const user = String(params[0])
            if (table === learningPracticeEvents) {
              const category = String(params[1])
              assert.equal(held, `${user}:practice-projection:${category}`)
              assert.equal(limit, 120)
              state.metrics.historyReads++
              const rows = state.events.filter(row => row.userId === user && row.category === category &&
                row.at >= new Date(String(params[2])) && params.includes(row.kind))
                .sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit)
              state.metrics.historyRows += rows.length
              const snapshot = structuredClone(rows)
              await state.afterHistoryRead?.()
              return snapshot
            }
            assert.equal(table, memFacts)
            assert.equal(limit, 1)
            assert.ok(params.includes('active'))
            const category = held.split(':practice-projection:')[1]!
            assert.ok(params.includes(`practice:${category}`))
            state.metrics.profileReads++
            const fact = state.facts.get(projectionKey(user, category))
            return fact ? [{ metadata: structuredClone(fact.metadata) }] : []
          },
        }
        return chain
      },
    }
    try { return await callback(tx) }
    finally {
      if (held) {
        const next = locks.get(held)!.shift()
        if (next) next(); else locks.delete(held)
      }
      state.metrics.openTransactions--
      const next = poolQueue.shift()
      if (next) next(); else open--
    }
  } }
  return db
}
