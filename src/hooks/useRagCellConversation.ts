import { useLayoutEffect, useMemo, useRef } from 'react'
import { useCellsStore } from '@/store/useCellsStore'
import { parseRagCellContent } from '@/helpers/parseRagCellContent'
import { appendRagExchange } from '@/helpers/appendRagExchange'
import type { FormState } from '@/types/actionTypes'

interface UseRagCellConversationArgs {
  cell: { id: string; content: string }
  state: FormState
  isPending: boolean
}

/**
 * Keeps a rag cell's conversation in the cell content, so an answer survives a
 * remount, a reload and a sync instead of living only in useActionState.
 */
export function useRagCellConversation({ cell, state, isPending }: UseRagCellConversationArgs) {
  const updateCell = useCellsStore((s) => s.updateCell)
  const content = useMemo(() => parseRagCellContent(cell.content), [cell.content])
  const askedQuestion = useRef('')
  const persistedTimestamp = useRef(0)

  // Layout effect, not effect: the answer has to be in the cell content before
  // paint, or the conversation renders one empty frame between the action
  // settling and the message landing in history.
  useLayoutEffect(() => {
    if (isPending || state.status !== 'SUCCESS' || !state.message) return
    if (persistedTimestamp.current === state.timestamp) return
    persistedTimestamp.current = state.timestamp

    updateCell(
      cell.id,
      appendRagExchange(content, {
        question: askedQuestion.current || content.topic,
        answer: state.message,
        sources: state.values?.sources as string[] | undefined,
      })
    )
  }, [isPending, state, cell.id, content, updateCell])

  return {
    topic: content.topic,
    messages: content.messages,
    origin: content.origin,
    searchTopic: content.searchTopic,
    pendingQuestion: isPending ? askedQuestion.current || content.topic : null,
    rememberQuestion: (question: string) => {
      askedQuestion.current = question
    },
  }
}
