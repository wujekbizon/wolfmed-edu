import 'server-only'
import { JEV_SPEC_VERSION } from '@/constants/jev'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import type { PracticeCardProgress, PracticeItem } from '@/types/learningPracticeTypes'

export function toPracticeCardProgress(item: PracticeItem, catalogVersion: string): PracticeCardProgress {
  const last = item.attempts.at(-1)
  const support = getReviewedPracticeSupport(item.id, item.revision, catalogVersion)
  const decision = item.support?.specVersion === JEV_SPEC_VERSION ? item.support : null
  return {
    id: item.id, revision: item.revision, version: item.version,
    selected: last?.selected ?? null, correct: last?.correct ?? null,
    correctIndex: item.correctIndex ?? null, attempts: item.attempts.length,
    hintOpened: item.hintOpened, priorExposure: item.priorExposure,
    resolved: item.outcome !== null, invalid: item.outcome === 'invalid', outcome: item.outcome,
    hint: item.hintOpened ? support?.hints[item.support?.hintIndex ?? 0] ?? null : null,
    explanation: item.correctIndex !== undefined ? support?.explanation ?? null : null,
    attemptId: last?.eventId ?? null,
    suggestedAction: decision?.mode === 'active' ? decision.action ?? null : null,
    suggestedTarget: decision?.mode === 'active' ? decision.target ?? null : null,
    suggestedEventId: decision?.trigger ?? null,
  }
}
