'use client'

import { useActionState, useEffect, useRef } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useRagCellInput } from '@/hooks/useRagCellInput'
import { useRagProgress } from '@/hooks/useRagProgress'
import { useRagCellConversation } from '@/hooks/useRagCellConversation'
import { useRagAutoSubmit } from '@/hooks/useRagAutoSubmit'
import { useRagToolResults } from '@/hooks/useRagToolResults'
import { useAttachExplanationToMindMap } from '@/hooks/useAttachExplanationToMindMap'
import RagConversation from './RagConversation'
import RagCellInputBar from './RagCellInputBar'
import RagProgressIndicator from './RagProgressIndicator'

export default function RagCellForm({ cell }: { cell: { id: string; content: string } }) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const conversationRef = useRef<HTMLDivElement>(null)

  const noScriptFallback = useToastMessage(state)
  const input = useRagCellInput()
  const progress = useRagProgress()
  const conversation = useRagCellConversation({ cell, state, isPending })

  const handleSubmit = (formData: FormData) => {
    conversation.rememberQuestion(formData.get('question') as string)
    formData.append('jobId', progress.jobId)
    progress.startListening()
    action(formData)
  }

  useRagAutoSubmit({
    cellId: cell.id,
    topic: conversation.topic,
    textareaRef: input.textareaRef,
    onSubmit: handleSubmit,
  })
  useRagToolResults({ state, cellId: cell.id })
  useAttachExplanationToMindMap({ origin: conversation.origin, state, isPending })

  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversation.messages.length, isPending])

  const { reset: resetProgress } = progress
  useEffect(() => {
    if (!isPending && state.status !== 'UNSET') {
      resetProgress()
    }
  }, [isPending, state.status, resetProgress])

  return (
    <div className="flex flex-col h-full bg-zinc-50 rounded-lg border border-zinc-200">
      <div ref={conversationRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        <RagConversation
          messages={conversation.messages}
          pendingQuestion={conversation.pendingQuestion}
          progress={
            isPending && (
              <RagProgressIndicator
                stage={progress.stage}
                progress={progress.progress}
                message={progress.message}
                tool={progress.tool}
                userLogs={progress.userLogs}
                technicalLogs={progress.technicalLogs}
                error={progress.error}
              />
            )
          }
        />
      </div>

      <RagCellInputBar
        cellId={cell.id}
        topic={conversation.topic}
        state={state}
        isPending={isPending}
        input={input}
        onSubmit={handleSubmit}
        noScriptFallback={noScriptFallback}
      />
    </div>
  )
}
