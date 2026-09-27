import 'server-only'
import { randomUUID } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { JEV_MODEL, JEV_SPEC_VERSION } from '@/constants/jev'
import { buildPracticeView } from './buildView'
import { loadPracticeQuestion } from './loadQuestion'
import { getJevConfig } from './jevConfig'
import { nextPracticeEventOrdinal } from './nextEventOrdinal'
import { getPracticeDecisionCandidates } from '@/helpers/getPracticeDecisionCandidates'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import { getPracticeItem } from './getPracticeItems'
import { savePracticeItem } from './savePracticeItem'
import type { JevConfig, JevDecision, PracticeSupportContext } from '@/types/jevTypes'

export async function savePracticeSupport(
  userId: string, context: PracticeSupportContext, config: JevConfig, decision: JevDecision | null, latencyMs: number,
) {
  if (getJevConfig()?.mode !== config.mode) return null
  return db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, context.request.sessionId), eq(learningPracticeSessions.userId, userId),
    )).for('update')
    if (!session || session.version !== context.request.version || session.status !== 'active') return null
    const currentItem = await getPracticeItem(tx, session)
    const item = currentItem?.item
    if (!item || item.id !== context.item.id || item.revision !== context.item.revision ||
      item.learningEventId !== context.trigger || item.support?.trigger === context.trigger) return null
    const current = await loadPracticeQuestion(tx, item.id, session.category)
    if (current?.revision !== item.revision) return null
    const currentMaterial = getReviewedPracticeSupport(item.id, item.revision, session.catalogVersion)?.material ?? null
    if (JSON.stringify(currentMaterial) !== JSON.stringify(context.target.material)) return null
    const candidates = getPracticeDecisionCandidates(context.state)
    if (JSON.stringify(candidates) !== JSON.stringify(context.candidates)) return null
    const candidate = context.candidates.find((entry) => entry.id === decision?.choice)
    const accepted = config.mode === 'active' && decision && candidate && decision.confidence >= config.minConfidence!
    const hintIndex = 0
    item.support = {
      trigger: context.trigger, hintIndex, specVersion: JEV_SPEC_VERSION,
      action: accepted && candidate ? candidate.id : null, mode: config.mode,
      target: accepted && candidate?.id === 'material' ? context.target.material
        : accepted && candidate?.id === 'plan' ? context.target.plan : null,
    }
    await savePracticeItem(tx, session.id, currentItem!.position, item)
    const response = await buildPracticeView(tx, session, item.id, true)
    await tx.insert(learningPracticeEvents).values({
      sessionId: session.id, eventId: randomUUID(), ordinal: await nextPracticeEventOrdinal(tx, session.id), type: 'support_decided',
      questionId: item.id, questionRevision: item.revision, response,
      payload: { spec: JEV_SPEC_VERSION, model: JEV_MODEL, policy: session.policyVersion,
        mode: config.mode, trigger: context.trigger, candidates: context.candidates.map((entry) => entry.id),
        choice: decision?.choice ?? null, probabilities: decision?.probabilities ?? null,
        confidence: decision?.confidence ?? null, inputTokens: decision?.inputTokens ?? null,
        outputTokens: decision?.outputTokens ?? null, hintIndex, latencyMs,
        fallback: !context.candidates.length ? 'no_eligible_action'
          : !decision ? 'provider_unavailable_or_invalid' : config.mode === 'shadow' ? 'shadow'
          : !candidate ? 'none' : !accepted ? 'low_confidence' : null },
    })
    return response
  })
}
