import 'server-only'
import { JEV_INSTRUCTIONS, JEV_MODEL, JEV_SPEC_VERSION } from '@/constants/jev'
import { parsePracticeJevChoice } from '@/helpers/parsePracticeJevChoice'
import { callJev } from '@/server/jev/callJev'
import type { JevCandidate, JevDecision, JevState } from '@/types/jevTypes'
import type { JevAuditContext } from '@/types/jevAuditTypes'

export async function selectJevSupport(
  apiKey: string, state: JevState, candidates: JevCandidate[],
  context: Pick<JevAuditContext, 'userId' | 'sessionId'>,
): Promise<JevDecision | null> {
  const criteria = Object.fromEntries(candidates.map((candidate) => [candidate.id, candidate.text]))
  return callJev(apiKey, { model: JEV_MODEL, state, questions: {
    support: { type: 'choice', instructions: JEV_INSTRUCTIONS,
      criteria: { ...criteria, none: 'No recommendation is useful now.' } },
  } }, { ...context, source: 'practice', route: 'learning.practice', policyVersion: JEV_SPEC_VERSION },
  (raw) => parsePracticeJevChoice(raw, candidates))
}
