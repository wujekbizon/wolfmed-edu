import assert from 'node:assert/strict'
import { practiceCard, practiceView } from '../../companion/fixtures/practiceView'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { practiceReadDatabase as db } from './practiceReadDatabase'
import { practiceReadProbe as probe, practiceProbeUser } from './practiceReadProbe'
import type { WolfekPracticeReference } from '@/types/wolfekResponseTypes'

const unexpected = () => { throw new Error('Unexpected operation in F05 hint/comparison probe') }
export const practiceReadServices = {
  db,
  getIsPremium: async () => probe.premium,
  requireCategoryAccess: async () => practiceProbeUser,
  getUserEnrolledCourses: unexpected,
  getCategoryPerformance: unexpected, getQuestionAccuracyAnalytics: unexpected,
  getUserStorageUsage: unexpected, getUserBadges: unexpected,
  getPlanProgress: unexpected, getBillingOverview: unexpected,
  getKierunkiWolfekRateLimitIdentity: async () => practiceProbeUser,
  checkRateLimit: async () => ({ success: true }),
  beginWolfekSubmission: async () => ({ reused: null, complete: async () => {} }),
  recordWolfekInteraction: async () => {},
  getRedis: () => ({ get: async () => {
    if (probe.changeVersionDuringCache) probe.session!.version++
    return probe.cachedHelp ? { answer: 'Cached synthetic help', sources: [], grounded: true } : null
  }, set: async () => { probe.metrics.cacheWrites++ } }),
  retrieveContext: async (input: { userId: string }) => {
    assert.equal(input.userId, practiceProbeUser)
    probe.metrics.retrievalCalls++
    if (probe.changeVersionDuringRetrieval) probe.session!.version++
    return { chunks: probe.noSources ? [] : [{ text: 'Synthetic source material' }], sources: [], hasCanonical: !probe.noSources }
  },
  generateGroundedAnswer: async (_question: string, _context: unknown, options: { practiceContext: string }) => {
    assert.equal(probe.metrics.openTransactions, 0, 'No transaction may stay open during inference')
    assert.equal(Object.hasOwn(JSON.parse(options.practiceContext), 'storedKey'), probe.expectExplain)
    probe.metrics.modelCalls++
    if (probe.changeVersionDuringModel) probe.session!.version++
    return { answer: 'Synthetic grounded help', sources: [] }
  },
  recordWolfekLearningAssistance: async (userId: string, ref: WolfekPracticeReference) => {
    assert.equal(userId, practiceProbeUser)
    assert.equal(ref.version, probe.session!.version, 'No assistance writes for stale progress')
    if (probe.failPersistence) throw new WolfekQuestionError('Synthetic persistence failure')
    probe.metrics.assistanceWrites++
    return practiceView({ id: probe.session!.id, version: ref.version + 1 })
  },
  startPracticeSession: unexpected,
  mutatePracticeSession: async (_user: string, _category: string, mutation: { version: number; questionId: string }) => {
    assert.equal(mutation.version, probe.session!.version)
    const item = probe.session!.items.find(candidate => candidate.id === mutation.questionId)!
    item.revealed = true
    probe.session!.version++
    return practiceView({ id: probe.session!.id, version: probe.session!.version,
      question: { ...practiceCard(item.id, { revision: item.revision, correctIndex: 0 }),
        text: 'Synthetic learning question', options: ['A', 'B'], supportPending: false } })
  },
}
