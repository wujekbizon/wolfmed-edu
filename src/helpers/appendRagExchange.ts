import { RAG_MAX_MESSAGES } from '@/constants/ragCell'
import type { RagCellContent } from '@/types/ragCellTypes'
import type { SourceRef } from '@/types/retrievalTypes'

interface RagExchange {
  question: string
  answer: string
  sources?: SourceRef[] | undefined
}

export function appendRagExchange(
  content: RagCellContent,
  { question, answer, sources }: RagExchange
): string {
  const messages = [
    ...content.messages,
    { role: 'user' as const, text: question },
    { role: 'assistant' as const, text: answer, ...(sources?.length ? { sources } : {}) },
  ]

  return JSON.stringify({
    ...content,
    messages: messages.slice(-RAG_MAX_MESSAGES),
  })
}
