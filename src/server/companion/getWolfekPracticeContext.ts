import 'server-only'
import { getIsPremium } from '@/server/premium'
import { loadWolfekPracticeCard } from './loadWolfekPracticeCard'
import type { WolfekContext, WolfekPracticeReference } from '@/types/wolfekResponseTypes'

export async function getWolfekPracticeContext(userId: string, ref: WolfekPracticeReference): Promise<WolfekContext> {
  const [base, premium] = await Promise.all([loadWolfekPracticeCard(userId, ref), getIsPremium()])
  const last = base.item.attempts.at(-1)
  const answerVisible = base.item.revealed || last?.correct === true
  return {
    destinations: {
      currentCard: { type: 'rag_hint' }, comparison: { type: 'rag_compare' },
      currentCardTutor: { type: answerVisible ? 'rag_explain' : 'confirm_reveal_then_tutor' },
    },
    facts: {
      card: { loaded: true, questionText: base.question.question, revisionCurrent: true,
        answerVisible, resolved: Boolean(base.item.outcome),
        selectedAnswerPresent: ref.selected != null || last?.selected !== undefined },
      access: { categoryAllowed: true, premiumTutorAllowed: premium, ragHelpAvailable: premium },
    },
  }
}
