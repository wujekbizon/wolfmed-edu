import 'server-only'
import { getIsPremium } from '@/server/premium'
import { getPlanProgress } from '@/server/planner/progress'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { JEV_SPEC_VERSION } from '@/constants/jev'
import { loadWolfekPracticeCard } from './loadWolfekPracticeCard'
import type { WolfekContext, WolfekPracticeReference } from '@/types/wolfekResponseTypes'

export async function getWolfekPracticeContext(userId: string, ref: WolfekPracticeReference): Promise<WolfekContext> {
  const [base, premium, plan] = await Promise.all([
    loadWolfekPracticeCard(userId, ref), getIsPremium().catch(() => false), getPlanProgress(userId).catch(() => null),
  ])
  const last = base.item.attempts.at(-1)
  const answerVisible = base.item.revealed || last?.correct === true
  const material = base.support?.material ?? null
  const relevant = Boolean(plan?.suggestion && plan.suggestion.remainingMinutesToday > 0 &&
    CATEGORY_METADATA[ref.category]?.course === plan.plan.courseSlug)
  const suggestion = base.item.support?.specVersion === JEV_SPEC_VERSION ? base.item.support : null
  const destinations: WolfekContext['destinations'] = {
    currentCard: { type: 'show_hint' }, currentCardTutor: { type: answerVisible ? 'open_tutor' : 'confirm_reveal_then_tutor' },
    verifiedReviewCard: { type: 'review_card' }, nextCard: { type: 'next_card' },
  }
  destinations.comparison = { type: 'highlight_comparison' }
  if (material) destinations.verifiedMaterial = { type: 'link', href: material.href }
  if (relevant) destinations.plan = { type: 'link', href: '/panel/plan' }
  if (suggestion?.action && suggestion.action !== 'tutor') {
    destinations.currentRecommendation = suggestion.target
      ? { type: 'link', href: suggestion.target.href } : { type: suggestion.action === 'compare' ? 'highlight_comparison'
        : suggestion.action === 'review' ? 'review_card' : suggestion.action === 'continue' ? 'next_card' : 'show_hint' }
  }
  const hint = base.support?.hints[0] ?? null
  return { destinations, facts: {
    card: { loaded: true, questionText: base.question.question, revisionCurrent: true, answerVisible, resolved: Boolean(base.item.outcome),
      selectedAnswerPresent: last?.selected !== undefined, hasHint: Boolean(hint),
      reviewedHintText: hint, hintSourceLabel: base.support?.source ?? null,
      availableExplanationNotice: base.support?.explanation ? 'Sprawdzone wyjaśnienie jest dostępne przy tej karcie.' : 'Nie ma sprawdzonego wyjaśnienia do tej karty.',
      comparisonFocusText: last ? `Twój wybór: „${base.question.answers[last.selected]?.option ?? ''}”. Sprawdź, czy odpowiada dokładnie treści pytania.` : null },
    access: { categoryAllowed: true, premiumTutorAllowed: premium },
    material: { verified: Boolean(material), title: material?.label ?? null },
    review: { available: base.reviewAvailable }, plan: { relevant, relevantActivityText: relevant ? plan!.suggestion!.label : null },
    navigation: { canContinue: base.canContinue },
    recommendation: { valid: Boolean(destinations.currentRecommendation),
      message: suggestion?.action ? 'Możesz skorzystać z aktualnej propozycji pomocy do tej karty.' : null },
  } }
}
