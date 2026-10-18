import { registerHooks } from 'node:module'
import { PgDialect, pgTable, text } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import type { PracticeProgressVersions, TestSessionProgress } from '@/types/testTypes'

export const sessionId = '11111111-1111-4111-8111-111111111111'
export const questionId = '22222222-2222-4222-8222-222222222222'
export const clientId = '33333333-3333-4333-8333-333333333333'
export const payload = { sessionId, answers: { [questionId]: { answerIndex: 1,
  revision: 1, baseRevision: 0, clientId } } }
export const state = {
  row: { id: sessionId, userId: 'owner', mode: 'PRACTICE', status: 'ACTIVE', category: 'opiekun-medyczny',
    questionIds: [questionId], progress: {} as TestSessionProgress,
    meta: { practiceProgressVersions: {} as PracticeProgressVersions } },
  access: true,
  writes: [] as Array<{ progress: TestSessionProgress; meta: unknown }>,
}
const testSessions = pgTable('sessions', { id: text(), userId: text(), mode: text(), status: text() })
const tx = {
  select: () => ({ from: () => ({ where: (condition: SQL) => ({ for: async () => {
    const { params } = new PgDialect().sqlToQuery(condition)
    return [state.row.id, state.row.userId, state.row.mode].every((value) => params.includes(value)) ? [state.row] : []
  } }) }) }),
  update: () => ({ set: (values: typeof state.writes[number]) => ({ where: async () => { state.writes.push(values) } }) }),
}
const fixture = { testSessions, db: { transaction: async (run: (transaction: typeof tx) => Promise<unknown>) => run(tx) },
  getUserEnrollments: async () => state.access ? [{ courseSlug: 'opiekun-medyczny', accessTier: 'basic' }] : [] }
const registry = globalThis as typeof globalThis & { practicePersistenceFixture?: typeof fixture }
registry.practicePersistenceFixture = fixture
const replacements: Record<string, string> = {
  'server-only': 'export {}',
  '@/server/db/index': 'export const db = globalThis.practicePersistenceFixture.db',
  '@/server/db/schema': 'export const testSessions = globalThis.practicePersistenceFixture.testSessions; export const userCustomCategories = {}',
  '@/server/queries': 'export const getUserEnrollments = globalThis.practicePersistenceFixture.getUserEnrollments',
}
export const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
  const source = replacements[specifier]
  return source ? { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    : nextResolve(specifier, context)
} })
