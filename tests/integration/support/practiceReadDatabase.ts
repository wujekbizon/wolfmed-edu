import assert from 'node:assert/strict'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import { learningPracticeItems, learningPracticeSessions, tests } from '@/server/db/schema'
import { practiceReadProbe as probe, practiceProbeId, practiceProbeQuestion, practiceProbeUser } from './practiceReadProbe'

export const practiceReadTransaction = {
  select(selection?: Record<string, unknown>) {
    let table: unknown
    let params: unknown[] = []
    let maximum: number | null = null
    const read = () => {
      assert.ok(probe.session)
      probe.metrics.queries++
      let rows: unknown[]
      if (table === tests) {
        const id = params.find(value => typeof value === 'string')
        assert.equal(typeof id, 'string')
        if (id === practiceProbeId(1)) probe.metrics.cardReads++
        else probe.metrics.reviewQuestionReads++
        rows = [{ id, data: practiceProbeQuestion, meta: { category: probe.session.category, course: 'opiekun-medyczny' } }]
      } else if (table === learningPracticeSessions) {
        assert.ok(params.includes(practiceProbeUser), 'Session query must scope ownership')
        assert.ok(params.includes(probe.session.id), 'Session query must scope session')
        assert.ok(params.includes(probe.session.category), 'Session query must scope category')
        probe.metrics.sessionReads++
        if (probe.session.userId !== practiceProbeUser) rows = []
        else if (selection) {
          const record: Record<string, unknown> = { ...probe.session }
          const itemExpression = selection.item as SQL | undefined
          const itemParams = itemExpression ? new PgDialect().sqlToQuery(itemExpression).params : []
          record.item = probe.session.items.find(item => itemParams.includes(item.id)) ?? null
          rows = [Object.fromEntries(Object.keys(selection).map(key => [key, record[key]]))]
        } else rows = [probe.session]
      } else if (table === learningPracticeItems) {
        assert.ok(params.includes(probe.session.id), 'Saved-item read must scope session')
        if (selection) {
          probe.metrics.savedItemReads++
          const item = probe.session.items.find(candidate => params.includes(candidate.id))
          rows = item ? [{ item }] : []
        } else {
          probe.metrics.reviewScans++
          rows = probe.session.items.map((item, position) => ({ sessionId: probe.session!.id, questionId: item.id, item, position }))
        }
      } else throw new Error('Unexpected table in learning read probe')
      if (maximum !== null) rows = rows.slice(0, maximum)
      probe.metrics.serializedResultBytes += Buffer.byteLength(JSON.stringify(rows))
      return structuredClone(rows)
    }
    const chain = {
      from(value: unknown) { table = value; return chain },
      where(condition: SQL) { params = new PgDialect().sqlToQuery(condition).params; return chain },
      limit(value: number) { maximum = value; return chain },
      for(lock: string) { assert.equal(lock, 'share'); return chain },
      then(resolve: (rows: unknown[]) => unknown, reject: (error: unknown) => unknown) {
        return Promise.resolve().then(read).then(resolve, reject)
      },
    }
    return chain
  },
}

export const practiceReadDatabase = {
  async transaction<T>(callback: (tx: typeof practiceReadTransaction) => Promise<T>) {
    probe.metrics.transactions++
    probe.metrics.openTransactions++
    try { return await callback(practiceReadTransaction) }
    finally { probe.metrics.openTransactions-- }
  },
}
