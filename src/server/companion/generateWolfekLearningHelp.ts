import 'server-only'
import { createHash } from 'node:crypto'
import { getRedis } from '@/lib/redis'
import { retrieveContext } from '@/server/retrieval/context'
import { generateGroundedAnswer } from '@/server/vertex-rag'
import { loadWolfekPracticeCard } from './loadWolfekPracticeCard'
import { WOLFEK_LEARNING_NO_SOURCE, WOLFEK_LEARNING_PROMPTS,
  WOLFEK_LEARNING_CACHE_SECONDS, WOLFEK_LEARNING_CACHE_VERSION } from '@/constants/wolfekLearning'
import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import type { WolfekQuestionRequest } from '@/types/wolfekResponseTypes'
import type { WolfekGeneratedHelp, WolfekLearningMode } from '@/types/wolfekLearningTypes'

export async function generateWolfekLearningHelp(userId: string, input: WolfekQuestionRequest, mode: WolfekLearningMode) {
  const ref = input.practice!
  const base = await loadWolfekPracticeCard(userId, ref)
  const last = base.item.attempts.at(-1)
  const selected = ref.selected ?? last?.selected ?? null
  const visible = base.item.revealed || last?.correct === true
  if (mode === 'explain' && !visible) throw new WolfekQuestionError('Najpierw potwierdź ujawnienie odpowiedzi.')
  if (mode === 'compare' && selected === null) throw new WolfekQuestionError('Najpierw zaznacz odpowiedź do porównania.')
  const redis = getRedis()
  const key = `wolfek:rag:${createHash('sha256').update(JSON.stringify([WOLFEK_LEARNING_CACHE_VERSION,
    userId, ref.category, ref.questionId, ref.revision, mode, selected,
    input.origin === 'typed' ? [input.question, input.recentMessages ?? []] : null])).digest('hex')}`
  try {
    const cached = await redis?.get<WolfekGeneratedHelp>(key)
    if (cached?.grounded) return cached
  } catch {}
  const context = await retrieveContext({ userId, query: base.support?.topic || base.question.question, mode: 'canonical_only' })
  if (!context.chunks.length) return { answer: WOLFEK_LEARNING_NO_SOURCE, sources: [], grounded: false }
  const result = await generateGroundedAnswer(`${WOLFEK_LEARNING_PROMPTS[mode]} Odpowiedz zwykłym tekstem po polsku, bez Markdown.
    Zwracaj się bezpośrednio do użytkownika w drugiej osobie: „Wybrałeś”, „Twój wybór”. Nie pisz „Uczeń wybrał”.
    Wykorzystaj wyłącznie adekwatne źródła. Jeśli nie pozwalają odpowiedzieć na to pytanie, zwróć dokładnie: ${WOLFEK_LEARNING_NO_SOURCE}`, context, {
    practiceContext: JSON.stringify({ question: base.question.question,
      options: base.question.answers.map((answer, index) => ({ label: String.fromCharCode(65 + index), text: answer.option })),
      selected: selected === null ? null : String.fromCharCode(65 + selected), userQuestion: input.question,
      ...(mode === 'explain' ? { storedKey: String.fromCharCode(65 + base.question.answers.findIndex((answer) => answer.isCorrect)) } : {}),
    }),
    recentMessages: mode === 'explain' ? input.recentMessages ?? [] : [],
    maxOutputTokens: mode === 'hint' ? 160 : mode === 'compare' ? 400 : 750,
  })
  await loadWolfekPracticeCard(userId, ref)
  const grounded = result.answer.trim() !== WOLFEK_LEARNING_NO_SOURCE
  const help = { ...result, sources: grounded ? result.sources : [], grounded }
  if (grounded) {
    try { await redis?.set(key, help, { ex: WOLFEK_LEARNING_CACHE_SECONDS }) } catch {}
  }
  return help
}
