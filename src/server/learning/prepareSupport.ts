import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { learningPracticeEvents, learningPracticeSessions } from '@/server/db/schema'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getPracticeDecisionCandidates } from '@/helpers/getPracticeDecisionCandidates'
import { getReviewedPracticeSupport } from '@/helpers/getReviewedPracticeSupport'
import { getPracticeObservations } from './getPracticeObservations'
import { getRelevantQuizHistory } from './getRelevantQuizHistory'
import { getRelevantStudyActivity } from './getRelevantStudyActivity'
import { getPlanProgress } from '@/server/planner/progress'
import { getIsPremium } from '@/server/premium'
import { loadPracticeQuestion } from './loadQuestion'
import { getPracticeItem } from './getPracticeItems'
import { getPracticeCoachingEvidence } from './getPracticeCoachingEvidence'
import { hasPracticeReviewCard } from './hasPracticeReviewCard'
import type { PracticeSupportContext, PracticeSupportRequest } from '@/types/jevTypes'
import type { JevSupportAction } from '@/types/learningPracticeTypes'

export async function preparePracticeSupport(userId: string, request: PracticeSupportRequest): Promise<PracticeSupportContext | null> {
  const base = await db.transaction(async (tx) => {
    const [session] = await tx.select().from(learningPracticeSessions).where(and(
      eq(learningPracticeSessions.id, request.sessionId), eq(learningPracticeSessions.userId, userId),
      eq(learningPracticeSessions.category, request.category),
    )).limit(1)
    if (!session || session.status !== 'active' || session.version !== request.version) return null
    const item = (await getPracticeItem(tx, session))?.item
    if (!item?.learningEventId) return null
    const trigger = item.learningEventId
    if (item.support?.trigger === trigger) return null
    const evidence = await getPracticeCoachingEvidence(tx, session.id, item)
    if (!evidence) return null
    const question = await loadPracticeQuestion(tx, item.id, session.category)
    if (!question || question.revision !== item.revision || question.data.question.length > 4000 ||
      question.data.answers.some((answer) => answer.option.length > 1000)) return null
    const reviewAvailable = evidence.trigger === 'frequent_reveals'
      ? await hasPracticeReviewCard(tx, session, item.id) : false
    const interactionRows = await tx.select({ type: learningPracticeEvents.type,
      payload: learningPracticeEvents.payload })
      .from(learningPracticeEvents).where(and(
        eq(learningPracticeEvents.sessionId, session.id), eq(learningPracticeEvents.questionId, item.id),
        eq(learningPracticeEvents.questionRevision, item.revision),
        inArray(learningPracticeEvents.type, ['support_dismissed', 'comparison_opened']),
      ))
    const validActions: JevSupportAction[] = ['hint', 'compare', 'retry', 'reveal', 'review', 'tutor', 'material', 'plan', 'continue']
    const dismissedActions = [...new Set(interactionRows.flatMap(({ type, payload }) =>
      type === 'support_dismissed' && validActions.includes(payload.action as JevSupportAction)
        ? [payload.action as JevSupportAction] : []))]
    const comparisonUsed = interactionRows.some((row) => row.type === 'comparison_opened')
    return { session, item, trigger, question, dismissedActions, comparisonUsed, evidence, reviewAvailable }
  })
  if (!base) return null
  const [practice, priorTest, studyActivity, planProgress, premium] = await Promise.all([
    getPracticeObservations(userId, request.category),
    getRelevantQuizHistory(userId, request.category),
    getRelevantStudyActivity(userId, request.category),
    getPlanProgress(userId).catch(() => null),
    getIsPremium().catch(() => false),
  ])
  const reviewed = getReviewedPracticeSupport(base.item.id, base.item.revision, base.session.catalogVersion)
  const material = reviewed?.material ?? null
  const plan = planProgress?.suggestion && planProgress.suggestion.remainingMinutesToday > 0 &&
    CATEGORY_METADATA[request.category]?.course === planProgress.plan.courseSlug
    ? { label: planProgress.suggestion.label, pace: planProgress.paceStatus,
      remainingToday: planProgress.suggestion.remainingMinutesToday } : null
  const state = {
    trigger: base.evidence.trigger,
    currentCard: { attemptCount: base.item.attempts.length, answerVisible: base.item.revealed,
      hintUsed: base.item.hintOpened, comparisonUsed: base.comparisonUsed,
      verifiedTopic: reviewed?.topic ?? null },
    learningWindow: base.evidence.learningWindow,
    priorHelp: base.evidence.priorHelp,
    revealWindow: base.evidence.revealWindow,
    reviewAvailable: base.reviewAvailable,
    practice: { scope: 'last_30_days_up_to_120_events' as const,
      cards: practice.cards, firstCorrect: practice.firstCorrect, firstWrong: practice.firstWrong,
      retries: practice.retries, hints: practice.hints, reveals: practice.reveals,
      comparisons: practice.comparisons, tutorResponses: practice.tutorResponses },
    priorTest, studyActivity, plan, material: material ? { label: material.label } : null,
    tutorAvailable: premium,
    dismissedActions: base.dismissedActions,
  }
  const candidates = getPracticeDecisionCandidates(state)
  return { request, item: base.item, trigger: base.trigger,
    candidates, state, target: {
      material, plan: plan ? { label: plan.label, href: '/panel/plan' } : null,
    } }
}
