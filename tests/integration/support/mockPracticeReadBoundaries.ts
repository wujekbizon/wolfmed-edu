import { registerHooks } from 'node:module'
import { practiceReadServices } from './practiceReadServices'

const registry = globalThis as typeof globalThis & { f05Services?: typeof practiceReadServices }
registry.f05Services = practiceReadServices
const modules: Record<string, string[]> = {
  '@/server/db/index': ['db'],
  '@/server/premium': ['getIsPremium'],
  '@/server/learning/requireCategoryAccess': ['requireCategoryAccess'],
  '@/server/queries': ['getUserEnrolledCourses', 'getCategoryPerformance', 'getQuestionAccuracyAnalytics',
    'getUserStorageUsage', 'getUserBadges'],
  '@/server/planner/progress': ['getPlanProgress'],
  '@/server/payments/getBillingOverview': ['getBillingOverview'],
  '@/lib/rateLimit': ['checkRateLimit'],
  '@/lib/redis': ['getRedis'],
  '@/server/jev/recordWolfekInteraction': ['recordWolfekInteraction'],
  '@/server/retrieval/context': ['retrieveContext'],
  '@/server/vertex-rag': ['generateGroundedAnswer'],
  '@/server/learning/startSession': ['startPracticeSession'],
  '@/server/learning/mutateSession': ['mutatePracticeSession'],
  './getKierunkiWolfekRateLimitIdentity': ['getKierunkiWolfekRateLimitIdentity'],
  './beginWolfekSubmission': ['beginWolfekSubmission'],
  './recordWolfekLearningAssistance': ['recordWolfekLearningAssistance'],
}

export const practiceReadHooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'server-only') return { url: 'data:text/javascript,export {}', shortCircuit: true }
    const names = modules[specifier]
    if (names) {
      const source = names.map(name => `export const ${name} = globalThis.f05Services.${name}`).join(';')
      return { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
    }
    if (['pg', 'postgres', '@upstash/redis'].includes(specifier) || specifier.startsWith('@google')) {
      throw new Error(`External dependency forbidden in offline F05 test: ${specifier}`)
    }
    return nextResolve(specifier, context)
  },
})
