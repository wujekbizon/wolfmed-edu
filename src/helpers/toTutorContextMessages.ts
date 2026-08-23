import {
  RAG_RECENT_CONTEXT_MESSAGES,
  RAG_RECENT_CONTEXT_TEXT_LENGTH,
} from '@/constants/ragCell'
import type { TutorContextMessage } from '@/types/memoryTypes'
import type { RagMessage } from '@/types/ragCellTypes'

export function toTutorContextMessages(messages: RagMessage[]): TutorContextMessage[] {
  return messages.slice(-RAG_RECENT_CONTEXT_MESSAGES).map(({ role, text }) => ({
    role,
    text: text.slice(0, RAG_RECENT_CONTEXT_TEXT_LENGTH),
  }))
}
