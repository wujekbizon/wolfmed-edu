'use client'

import { startTransition, useActionState, useEffect, useRef } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from './useToastMessage'
import { useOnFormSuccess } from './useOnFormSuccess'
import { useRagCellInput } from './useRagCellInput'
import { useRagCellConversation } from './useRagCellConversation'
import { useRagAutoSubmit } from './useRagAutoSubmit'
import { useRagToolResults } from './useRagToolResults'
import { useAttachExplanationToMindMap } from './useAttachExplanationToMindMap'
import { useCommandSelection } from './useCommandSelection'
import { useStickToBottom } from './useStickToBottom'
import { toTutorContextMessages } from '@/helpers/toTutorContextMessages'
import type { RagCellProps } from '@/types/ragCellUiTypes'

export function useRagCellForm({ cell }: RagCellProps) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const conversationRef = useRef<HTMLDivElement>(null)
  const conversationContentRef = useRef<HTMLDivElement>(null)
  const submitting = useRef(false)
  const noScriptFallback = useToastMessage(state)
  const input = useRagCellInput()
  const conversation = useRagCellConversation({ cell, state, isPending })
  const selection = useCommandSelection()

  const handleSubmit = (formData: FormData) => {
    if (submitting.current || isPending) return
    submitting.current = true
    conversation.rememberQuestion(formData.get('question') as string)
    formData.set('recentMessages', JSON.stringify(toTutorContextMessages(conversation.messages)))
    startTransition(() => action(formData))
  }

  useRagAutoSubmit({
    cellId: cell.id,
    topic: conversation.topic,
    searchTopic: conversation.searchTopic,
    textareaRef: input.textareaRef,
    onSubmit: handleSubmit,
  })
  useRagToolResults({ state, cellId: cell.id })
  useAttachExplanationToMindMap({ origin: conversation.origin, state, isPending })
  useStickToBottom(conversationRef, conversationContentRef)

  useEffect(() => {
    if (!isPending && state.status !== 'UNSET') {
      submitting.current = false
    }
  }, [isPending, state.status, state.timestamp])

  useOnFormSuccess(state, () => {
    if (input.textareaRef.current) input.textareaRef.current.value = ''
  })

  return {
    state, isPending, input, conversation, selection, handleSubmit,
    conversationRef, conversationContentRef, noScriptFallback,
  }
}
