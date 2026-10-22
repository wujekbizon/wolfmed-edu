import assert from 'node:assert/strict'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import { completedTestes, testSessions } from '@/server/db/schema'
import type { SyntheticTest, TestFactsQuery } from './testFactsProbeTypes'

export const testFactsProbe = {
  history: [] as SyntheticTest[], queries: [] as TestFactsQuery[],
  failedQuery: null as TestFactsQuery['kind'] | null,
  reset(count: number) {
    this.queries = []; this.failedQuery = null
    this.history = Array.from({ length: count }, (_, index) => ({
      sessionLinked: true,
      score: 14, category: index % 2 ? 'anatomia' : 'fizjologia', numberOfQuestions: 40,
      testResult: Array.from({ length: 40 }, (_, question) => ({
        questionId: `question-${question}`, answer: question % 3 === 0,
      })),
    }))
  },
}

export const testFactsDatabase = {
  select(selection: Record<string, unknown>) {
    let joined = false
    const fields = Object.keys(selection)
    const kind: TestFactsQuery['kind'] = fields.includes('testResult') ? 'history'
      : fields.includes('category') ? 'categories' : 'totals'
    const chain = {
      from(table: unknown) { assert.equal(table, completedTestes); return chain },
      innerJoin(table: unknown) { assert.equal(table, testSessions); joined = true; return chain },
      async where(condition: SQL) {
        const filter = new PgDialect().sqlToQuery(condition)
        assert.ok(filter.params.includes('f03-user'), 'Query must retain the authenticated user filter')
        const history = testFactsProbe.history.filter(test => !joined || test.sessionLinked)
        const failed = testFactsProbe.failedQuery === kind
        let rows: Record<string, unknown>[] = []
        if (!failed) {
          if (kind === 'history') rows = history.map(test => ({ testResult: test.testResult }))
          else if (kind === 'categories') rows = history.map(({ score, category, numberOfQuestions }) =>
            ({ score, category, numberOfQuestions }))
          else {
            const values: Record<string, number> = { count: history.length,
              score: history.reduce((sum, test) => sum + test.score, 0),
              questions: history.reduce((sum, test) => sum + test.numberOfQuestions, 0) }
            rows = [Object.fromEntries(fields.map(field => [field, values[field]]))]
          }
        }
        testFactsProbe.queries.push({ kind, fields, rows: rows.length, failed,
          serializedResultBytes: failed ? 0 : Buffer.byteLength(JSON.stringify(rows)),
          answerEntries: kind === 'history' && !failed ? history.reduce((sum, test) => sum + test.testResult.length, 0) : 0 })
        if (failed) throw new Error(`Simulated ${kind} query failure`)
        return rows
      },
    }
    return chain
  },
}
