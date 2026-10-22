import { registerHooks } from 'node:module'
import { cache } from 'react'
import { eq } from 'drizzle-orm'
import { completedTestes, testSessions } from '@/server/db/schema'
import { extractSource, loadSource } from '../../support/loadSource'
import { preparedContextServices } from './preparedContextProbe'
import { testFactsDatabase as db } from './testFactsDatabaseProbe'

const dependencies = { db, completedTestes, testSessions, eq, cache }
const path = new URL('../../../src/server/queries.ts', import.meta.url)
const analytics = {
  ...loadSource<Pick<typeof import('@/server/queries'), 'getCategoryPerformance'>>(
    extractSource(path, 'getCategoryPerformance'), dependencies),
  ...loadSource<Pick<typeof import('@/server/queries'), 'getQuestionAccuracyAnalytics'>>(
    extractSource(path, 'getQuestionAccuracyAnalytics'), dependencies),
}
const services = { ...preparedContextServices, ...analytics, db }
const registry = globalThis as typeof globalThis & { f04Services?: typeof services }
registry.f04Services = services
const modules: Record<string, string[]> = {
  '@/server/queries': ['getUserEnrolledCourses', 'getCategoryPerformance', 'getQuestionAccuracyAnalytics',
    'getUserStorageUsage', 'getUserBadges'],
  '@/server/db/index': ['db'],
  '@/server/planner/progress': ['getPlanProgress'],
  '@/server/payments/getBillingOverview': ['getBillingOverview'],
  '@/server/premium': ['getIsPremium'],
  '@/server/learning/requireCategoryAccess': ['requireCategoryAccess'],
  '@/lib/rateLimit': ['checkRateLimit'],
  '@/server/jev/recordWolfekInteraction': ['recordWolfekInteraction'],
}
for (const name of ['getKierunkiWolfekRateLimitIdentity', 'beginWolfekSubmission',
  'getWolfekPracticeContext', 'deliverWolfekLearningHelp']) modules[`./${name}`] = [name]

export const testFactsHooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', shortCircuit: true }
    const names = modules[specifier]
    if (names) {
      const source = names.map(name => `export const ${name} = globalThis.f04Services.${name}`).join(';')
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    }
    if (['pg', 'postgres', '@upstash/redis'].includes(specifier) || specifier.startsWith('@google')) {
      throw new Error(`External dependency forbidden in offline F04 test: ${specifier}`)
    }
    return nextResolve(specifier, context)
  },
})
