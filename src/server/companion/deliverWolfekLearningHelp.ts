import 'server-only'
import { randomUUID } from 'node:crypto'
import { checkRateLimit } from '@/lib/rateLimit'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import { startPracticeSession } from '@/server/learning/startSession'
import { mutatePracticeSession } from '@/server/learning/mutateSession'
import { loadWolfekPracticeCard } from './loadWolfekPracticeCard'
import { generateWolfekLearningHelp } from './generateWolfekLearningHelp'
import { recordWolfekLearningAssistance } from './recordWolfekLearningAssistance'
import { authorizeWolfekQuestion } from './authorizeWolfekQuestion'
import type { WolfekQuestionRequest, WolfekQuestionState } from '@/types/wolfekResponseTypes'
import type { WolfekLearningMode } from '@/types/wolfekLearningTypes'

export async function deliverWolfekLearningHelp(userId: string, input: WolfekQuestionRequest, state: WolfekQuestionState) {
  const action = state.answer?.action?.type
  const confirmation = action === 'confirm_reveal_then_tutor' && input.preparedQuestionId === 'reveal_tutor'
  const modes: Record<string, WolfekLearningMode> = { rag_hint: 'hint', rag_compare: 'compare', rag_explain: 'explain' }
  const mode = confirmation ? 'explain' : action ? modes[action] : null
  if (!mode || !input.practice || !state.answer) return state
  await authorizeWolfekQuestion(userId, input)
  if (!(await checkRateLimit(userId, 'rag:query')).success) throw new WolfekQuestionError('Zbyt wiele pytań do AI. Spróbuj później.')
  let ref = input.practice
  let session = state.session
  if (confirmation) {
    const started = ref.sessionId ? null : await startPracticeSession(userId, ref.category, randomUUID())
    session = await mutatePracticeSession(userId, ref.category, { sessionId: ref.sessionId ?? started!.id,
      version: started?.version ?? ref.version, questionId: ref.questionId, command: 'reveal', eventId: randomUUID() })
    if (session.question?.id !== ref.questionId || session.question.correctIndex === null) {
      throw new WolfekQuestionError('Nie udało się ujawnić odpowiedzi. Spróbuj ponownie.')
    }
    ref = { ...ref, sessionId: session.id, version: session.version }
  }
  try {
    const generated = await generateWolfekLearningHelp(userId, { ...input, practice: ref }, mode)
    await authorizeWolfekQuestion(userId, input)
    await loadWolfekPracticeCard(userId, ref)
    if (generated.grounded) session = await recordWolfekLearningAssistance(userId, ref, input.submissionId, mode)
    return { ...state, ...(session ? { session } : {}), timestamp: Date.now(), sources: generated.sources,
      answer: { ...state.answer, text: generated.answer, action: null },
      values: { ...state.values, learningGenerated: true, learningGrounded: generated.grounded,
        learningMode: mode, userQuestion: input.question } }
  } catch (error) {
    return { ...state, status: 'ERROR' as const, answer: null, timestamp: Date.now(), ...(session ? { session } : {}),
      message: error instanceof WolfekQuestionError ? error.message : 'Nie udało się pobrać pomocy z materiałów. Spróbuj ponownie.' }
  }
}
