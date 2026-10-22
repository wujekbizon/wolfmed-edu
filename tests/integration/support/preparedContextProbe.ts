import assert from 'node:assert/strict'

export const preparedContextProbe = {
  reads: [] as string[], events: [] as string[], enrolled: true,
  completedTestCount: 17, failedRead: null as string | null,
  billingWait: null as (() => Promise<void>) | null,
  reset() {
    this.reads = []; this.events = []; this.enrolled = true; this.billingWait = null
    this.completedTestCount = 17; this.failedRead = null
  },
  read(name: string, userId: unknown) {
    assert.equal(userId, 'f03-user', 'Data read must retain the authenticated identity')
    this.reads.push(name)
    if (this.failedRead === name) throw new Error(`Simulated failure: ${name}`)
  },
}

const probe = preparedContextProbe
const unexpected = () => { throw new Error('Unexpected practice/provider dependency in dashboard test') }
const services = {
  async getUserEnrolledCourses(userId: unknown) {
    probe.read('access.enrollment', userId)
    return probe.enrolled ? [{ slug: 'opiekun-medyczny', accessTier: 'premium' }] : []
  },
  async getCategoryPerformance(userId: unknown) { probe.read('tests.categories', userId); return [] },
  async getQuestionAccuracyAnalytics(userId: unknown) { probe.read('tests.difficult', userId); return [] },
  async getUserStorageUsage(userId: unknown) {
    probe.read('home.storage', userId)
    return { storageUsed: 1024, storageLimit: 20 * 1024 * 1024 }
  },
  async getUserBadges(userId: unknown) { probe.read('home.badges', userId); return [] },
  async getPlanProgress(userId: unknown) { probe.read('home.plan', userId); return null },
  async getBillingOverview(userId: unknown) {
    probe.read('home.billing', userId)
    await probe.billingWait?.()
    return { subscriptions: [], lifetime: [] }
  },
  async checkRateLimit() { probe.events.push('rateLimit'); return { success: true } },
  async getKierunkiWolfekRateLimitIdentity() { return 'f03-user' },
  async beginWolfekSubmission() {
    probe.events.push('submission')
    return { reused: null, complete: async () => { probe.events.push('complete') } }
  },
  async recordWolfekInteraction() { probe.events.push('telemetry') },
  getWolfekPracticeContext: unexpected, deliverWolfekLearningHelp: unexpected,
  requireCategoryAccess: unexpected, getIsPremium: unexpected,
  db: {
    select() {
      probe.reads.push('tests.totals')
      return { from: () => ({ innerJoin: () => ({ where: async () => [{ count: probe.completedTestCount, score: 80, questions: 100 }] }) }) }
    },
  },
}

export { services as preparedContextServices }
