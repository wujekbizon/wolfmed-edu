'use client'

import { useActionState, useEffect, useRef } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useRagCellInput } from '@/hooks/useRagCellInput'
import { useRagProgress } from '@/hooks/useRagProgress'
import { useRagCellConversation } from '@/hooks/useRagCellConversation'
import { useRagAutoSubmit } from '@/hooks/useRagAutoSubmit'
import { useRagToolResults } from '@/hooks/useRagToolResults'
import { useAttachExplanationToMindMap } from '@/hooks/useAttachExplanationToMindMap'
import { AIAutocompleteDropdowns } from './AIAutocompleteDropdowns'
import RagConversation from './RagConversation'
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

      <div className="border-t border-zinc-200 bg-white p-2 sm:p-4">
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="cellId" value={cell.id} />

          <div className="relative">
            <textarea
              ref={input.textareaRef}
              name="question"
              defaultValue={conversation.topic}
              placeholder="Zadaj pytanie... (@ pliki, / polecenia)"
              rows={2}
              onChange={input.handleChange}
              onKeyDown={input.handleKeyDown}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none text-sm"
            />

            <AIAutocompleteDropdowns input={input} />

            <FieldError formState={state} name="question" />
          </div>

          <div className="flex items-center justify-between">
            <SubmitButton
              label="Wyślij"
              loading="Wysyłam..."
              disabled={isPending}
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
            />
          </div>

          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}
