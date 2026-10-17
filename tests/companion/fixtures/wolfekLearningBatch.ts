import learning from '@/content/wolfek/learning-practice.json'
import { WolfekPackSchema } from '@/server/schema'
import type { WolfekContext, WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export const learningPack = WolfekPackSchema.parse(learning)
export const learningInput = {
  route: 'learning.practice', question: 'Czy możesz dać mi wskazówkę do tego pytania?',
  origin: 'prepared', preparedQuestionId: 'hint', submissionId: crypto.randomUUID(),
  practice: { category: 'opiekun-medyczny', sessionId: null, version: 0,
    questionId: '00000000-0000-4000-8000-000000000001', revision: 'a'.repeat(64), selected: 0 },
} satisfies WolfekQuestionRequest
export const learningContext = {
  facts: {
    card: { loaded: true, questionText: 'Question', revisionCurrent: true,
      answerVisible: false, resolved: false, selectedAnswerPresent: true },
    access: { categoryAllowed: true, premiumTutorAllowed: true, ragHelpAvailable: true },
  },
  destinations: {
    currentCard: { type: 'rag_hint' }, comparison: { type: 'rag_compare' },
    currentCardTutor: { type: 'confirm_reveal_then_tutor' },
  },
} satisfies WolfekContext
