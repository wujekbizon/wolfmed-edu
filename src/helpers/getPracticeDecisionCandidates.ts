import type { JevCandidate, JevState } from '@/types/jevTypes'

export function getPracticeDecisionCandidates(state: JevState): JevCandidate[] {
  const candidates: JevCandidate[] = []
  if (!state.currentCard.answerVisible && !state.currentCard.comparisonUsed) candidates.push({
    id: 'compare', text: 'Offer a comparison of the selected answer with the wording of this card. Do not reveal or choose the correct option.',
  })
  if (state.trigger === 'frequent_reveals' && state.reviewAvailable) candidates.push({
    id: 'review', text: 'Offer a return to an earlier revealed card for a new attempt without opening help. Prior exposure remains marked; do not claim independent mastery.',
  })
  if (state.material) candidates.push({
    id: 'material', text: `Offer the verified course material: ${state.material.label}. Use when it specifically supports the current difficulty.`,
  })
  if (state.tutorAvailable) candidates.push({
    id: 'tutor', text: 'Invite a contextual RAG discussion after repeated errors or answer reveals. Reveal the current answer explicitly before opening the tutor if it is still hidden.',
  })
  if (state.plan) candidates.push({
    id: 'plan', text: `Suggest the existing relevant learning-plan activity: ${state.plan.label}. Do not edit the plan.`,
  })
  return candidates.filter((candidate) => candidate.id !== state.priorHelp?.kind &&
    !state.dismissedActions?.includes(candidate.id))
}
