import type { PracticeCardProgress, PracticeView } from '@/types/learningPracticeTypes'

export function practiceCard(id: string, overrides: Partial<PracticeCardProgress> = {}): PracticeCardProgress {
  return {
    id, revision: 'revision-1', version: 10, selected: null, correct: null, correctIndex: null,
    attempts: 0, hintOpened: false, priorExposure: false, resolved: false, invalid: false,
    hint: null, explanation: null, attemptId: null, suggestedAction: null, suggestedTarget: null,
    suggestedEventId: null, outcome: null, ...overrides,
  }
}

export function practiceView(overrides: Partial<PracticeView> = {}): PracticeView {
  return {
    id: 'session-1', category: 'opiekun-medyczny', startedAt: '2026-10-04T10:00:00Z',
    version: 10, index: 0, total: 2, status: 'active', cards: [], question: null,
    summary: { unassisted: 0, assisted: 0, revealed: 0, skipped: 0, invalid: 0 }, ...overrides,
  }
}
