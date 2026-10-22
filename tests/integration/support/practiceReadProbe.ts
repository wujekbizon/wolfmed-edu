import type { PracticeSession } from '@/types/learningPracticeServerTypes'
import type { PracticeItem } from '@/types/learningPracticeTypes'
import type { PracticeReadMetrics } from './practiceReadProbeTypes'

export const practiceProbeUser = 'f05-user'
export const practiceProbeQuestion = {
  question: 'Synthetic learning question for database-read measurement',
  answers: [{ option: 'Synthetic answer A', isCorrect: true }, { option: 'Synthetic answer B', isCorrect: false }],
}
export const practiceProbeId = (index: number) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
const emptyMetrics = (): PracticeReadMetrics => ({ transactions: 0, openTransactions: 0, queries: 0,
  cardReads: 0, sessionReads: 0, savedItemReads: 0, reviewScans: 0, reviewQuestionReads: 0,
  serializedResultBytes: 0, modelCalls: 0, retrievalCalls: 0, assistanceWrites: 0, cacheWrites: 0 })

export const practiceReadProbe = {
  session: null as PracticeSession | null,
  metrics: emptyMetrics(),
  premium: true,
  changeVersionDuringModel: false,
  cachedHelp: false, changeVersionDuringCache: false, noSources: false,
  changeVersionDuringRetrieval: false, expectExplain: false, failPersistence: false,
  reset(revealedCards: number, revision: string) {
    this.metrics = emptyMetrics()
    this.premium = true
    this.changeVersionDuringModel = false
    this.cachedHelp = false; this.changeVersionDuringCache = false; this.noSources = false
    this.changeVersionDuringRetrieval = false; this.expectExplain = false; this.failPersistence = false
    const item: PracticeItem = { id: practiceProbeId(1), revision, attempts: [], hintOpened: false,
      revealed: false, priorExposure: false, version: 0, outcome: null }
    this.session = {
      id: practiceProbeId(9999), userId: practiceProbeUser, category: 'opiekun-medyczny',
      items: [item, ...Array.from({ length: revealedCards }, (_, index) => ({ ...item,
        id: practiceProbeId(index + 2), revision: 'b'.repeat(64), revealed: true, outcome: 'revealed' as const }))],
      summary: { unassisted: 0, assisted: 0, revealed: revealedCards, skipped: 0, invalid: 0 },
      activeIndex: 0, version: 0, status: 'active', policyVersion: 'card-deck-v2',
      catalogVersion: 'reviewed-v1', experimentArm: 'rules',
      startedAt: new Date('2026-10-01T00:00:00Z'), finishedAt: null,
    }
  },
}
