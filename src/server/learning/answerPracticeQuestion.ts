import 'server-only'
import { retrieveContext } from '@/server/retrieval/context'
import { generateGroundedAnswer } from '@/server/vertex-rag'
import { buildStaticPrefix } from '@/server/memory/assemble'
import { toFormState } from '@/helpers/toFormState'
import { resolvePracticeTutorContext } from './resolveTutorContext'
import { recordPracticeTutorResponse } from './recordPracticeTutorResponse'
import type { PracticeReference } from '@/types/learningPracticeTypes'
import type { TutorContextMessage } from '@/types/memoryTypes'

export async function answerPracticeQuestion(
  userId: string, question: string, reference: PracticeReference, recentMessages: TutorContextMessage[],
) {
  const practice = await resolvePracticeTutorContext(userId, reference)
  const [context, memoryPrefix] = await Promise.all([
    retrieveContext({ userId, query: practice.searchTopic, mode: 'canonical_only' }),
    buildStaticPrefix(userId).catch(() => ''),
  ])
  const result = await generateGroundedAnswer(question, context, {
    practiceContext: practice.context, recentMessages, memoryPrefix,
  })
  await recordPracticeTutorResponse(userId, reference).catch(() => undefined)
  return { ...toFormState('SUCCESS', ''), values: { answer: result.answer, sources: result.sources } }
}
