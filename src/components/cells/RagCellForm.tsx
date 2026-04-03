'use client'

import { useActionState, useRef, useEffect, startTransition } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useRagCellInput } from '@/hooks/useRagCellInput'
import { useRagProgress } from '@/hooks/useRagProgress'
import RagResponse from './RagResponse'
import RagProgressIndicator from './RagProgressIndicator'
import { AIAutocompleteDropdowns } from './AIAutocompleteDropdowns'
import { useCellsStore } from '@/store/useCellsStore'
import { useRagStore } from '@/store/useRagStore'
import type { CellTypes } from '@/types/cellTypes'

export default function RagCellForm({ cell }: { cell: { id: string; content: string } }) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const submittedQuestion = useRef<string>('')
  const processedToolResults = useRef<Set<string>>(new Set())
  const handleSubmitRef = useRef<(fd: FormData) => void>(null!)

  const noScriptFallback = useToastMessage(state)
  const { insertCellAfterWithContent } = useCellsStore()
  const { pendingAutoSubmitCellId, setPendingAutoSubmitCellId } = useRagStore()

  const {
    textareaRef,
    showResourceAutocomplete,
    filteredResources,
    resourceSelectedIndex,
    resourcesLoading,
    insertResource,
    showCommandAutocomplete,
    filteredCommands,
    commandSelectedIndex,
    insertCommand,
    handleChange,
    handleKeyDown,
  } = useRagCellInput()

  const {
    jobId,
    stage,
    progress,
    message: progressMessage,
    tool,
    userLogs,
    technicalLogs,
    error: progressError,
    startListening,
    reset: resetProgress,
  } = useRagProgress()

  const handleSubmit = (formData: FormData) => {
    const question = formData.get('question') as string
    submittedQuestion.current = question
    formData.append('jobId', jobId)
    startListening()
    action(formData)
  }
  handleSubmitRef.current = handleSubmit

  // Scroll conversation to bottom on new response
  useEffect(() => {
    if (state.status === 'SUCCESS' && conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [state.status])

  // Reset SSE progress once the action settles
  useEffect(() => {
    if (!isPending && state.status !== 'UNSET') {
      resetProgress()
    }
  }, [isPending, state.status, resetProgress])

  // Auto-submit and scroll when triggered via SideAIInput
  useEffect(() => {
    if (pendingAutoSubmitCellId !== cell.id) return

    setPendingAutoSubmitCellId(null)
    document.getElementById(`cell-${cell.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    const topic = cell.content
    if (!topic) return

    if (textareaRef.current) {
      textareaRef.current.value = topic
    }

    const fd = new FormData()
    fd.set('question', topic)
    fd.set('cellId', cell.id)
    startTransition(() => handleSubmitRef.current(fd))
  }, [pendingAutoSubmitCellId, cell.id, cell.content, setPendingAutoSubmitCellId, textareaRef])

  // Insert AI-generated cells produced by tool calls
  useEffect(() => {
    if (state.status !== 'SUCCESS' || !state.values?.toolResults) return

    const toolResults = state.values.toolResults
    if (typeof toolResults !== 'object' || toolResults === null || Array.isArray(toolResults)) return

    Object.entries(toolResults).forEach(([toolName, result]) => {
      if (
        typeof result !== 'object' ||
        result === null ||
        !('content' in result) ||
        typeof (result as { content: unknown }).content !== 'string'
      ) return

      const typedResult = result as { cellType?: CellTypes; content: string }
      const resultKey = `${toolName}-${typedResult.content.slice(0, 50)}`

      if (typedResult.cellType && !processedToolResults.current.has(resultKey)) {
        processedToolResults.current.add(resultKey)
        insertCellAfterWithContent(cell.id, typedResult.cellType, typedResult.content)
      }
    })
  }, [state.status, state.values?.toolResults, cell.id, insertCellAfterWithContent])

  const showConversation = state.status === 'SUCCESS' || isPending
  const userQuestion = submittedQuestion.current || cell.content

  return (
    <div className="flex flex-col h-full bg-zinc-50 rounded-lg border border-zinc-200">
      <div ref={conversationRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {showConversation ? (
          <>
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-zinc-800 text-white rounded-lg px-4 py-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{userQuestion}</p>
              </div>
            </div>

            {isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] w-full">
                  <RagProgressIndicator
                    stage={stage}
                    progress={progress}
                    message={progressMessage}
                    tool={tool}
                    userLogs={userLogs}
                    technicalLogs={technicalLogs}
                    error={progressError}
                  />
                </div>
              </div>
            )}

            {state.status === 'SUCCESS' && state.message && !isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <RagResponse
                    answer={state.message}
                    sources={state.values?.sources as string[] | undefined}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-zinc-400 text-center">
              Zadaj pytanie aby rozpocząć rozmowę z asystentem AI
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white p-4">
        <form ref={formRef} action={handleSubmit} className="space-y-3">
          <input type="hidden" name="cellId" value={cell.id} />

          <div className="relative">
            <textarea
              ref={textareaRef}
              name="question"
              defaultValue={cell.content}
              placeholder="Zadaj pytanie... (@ pliki, / polecenia)"
              rows={2}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none text-sm"
            />

            <AIAutocompleteDropdowns
              showResourceAutocomplete={showResourceAutocomplete}
              showCommandAutocomplete={showCommandAutocomplete}
              filteredResources={filteredResources}
              filteredCommands={filteredCommands}
              resourceSelectedIndex={resourceSelectedIndex}
              commandSelectedIndex={commandSelectedIndex}
              resourcesLoading={resourcesLoading}
              insertResource={insertResource}
              insertCommand={insertCommand}
            />

            <FieldError formState={state} name="question" />
          </div>

          <div className="flex items-center justify-between">
            <SubmitButton
              label="Wyślij"
              loading="Wysyłam..."
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm"
            />
          </div>

          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}
