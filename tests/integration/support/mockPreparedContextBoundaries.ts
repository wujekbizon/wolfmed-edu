import { registerHooks } from 'node:module'
import { preparedContextServices } from './preparedContextProbe'

const registry = globalThis as typeof globalThis & { f03Services?: typeof preparedContextServices }
registry.f03Services = preparedContextServices
const queryExports = ['getUserEnrolledCourses', 'getCategoryPerformance', 'getQuestionAccuracyAnalytics',
  'getUserStorageUsage', 'getUserBadges']
const modules: Record<string, string[]> = {
  '@/server/queries': queryExports,
  '@/server/db/index': ['db'],
  '@/server/planner/progress': ['getPlanProgress'],
  '@/server/payments/getBillingOverview': ['getBillingOverview'],
  '@/server/premium': ['getIsPremium'],
  '@/server/learning/requireCategoryAccess': ['requireCategoryAccess'],
  '@/lib/rateLimit': ['checkRateLimit'],
  '@/server/jev/recordWolfekInteraction': ['recordWolfekInteraction'],
}
const companions = ['getKierunkiWolfekRateLimitIdentity', 'beginWolfekSubmission',
  'getWolfekPracticeContext', 'deliverWolfekLearningHelp']
for (const name of companions) modules[`./${name}`] = [name]

export const preparedContextHooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', shortCircuit: true }
    const names = modules[specifier]
    if (names) {
      const source = names.map(name => `export const ${name} = globalThis.f03Services.${name}`).join(';')
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    }
    if (['pg', 'postgres', '@upstash/redis'].includes(specifier) || specifier.startsWith('@google')) {
      throw new Error(`External dependency forbidden in offline F03 test: ${specifier}`)
    }
    return nextResolve(specifier, context)
  },
})
