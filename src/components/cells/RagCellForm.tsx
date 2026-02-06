'use client'

import { useActionState, useRef, useEffect } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useResourceAutocomplete } from '@/hooks/useResourceAutocomplete'
import { useResourceAutocompleteInput } from '@/hooks/useResourceAutocompleteInput'
import { useCommandAutocompleteInput } from '@/hooks/useCommandAutocompleteInput'
import RagResponse from './RagResponse'
import RagLoadingState from './RagLoadingState'
import { ResourceAutocomplete } from './ResourceAutocomplete'
import { CommandAutocomplete } from './CommandAutocomplete'
import { useCellsStore } from '@/store/useCellsStore'
import type { CellTypes } from '@/types/cellTypes'

export default function RagCellForm({ cell }: { cell: { id: string; content: string } }) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const submittedQuestion = useRef<string>('')
  const processedToolResults = useRef<Set<string>>(new Set())

  const noScriptFallback = useToastMessage(state)

  const { insertCellAfterWithContent } = useCellsStore()
  const { resources, loading } = useResourceAutocomplete()
  const {
    textareaRef,
    showAutocomplete,
    filteredResources,
    selectedIndex,
    handleInputChange: handleResourceInputChange,
    handleKeyDown: handleResourceKeyDown,
    insertResource,
  } = useResourceAutocompleteInput(resources)

  const {
    showCommandAutocomplete,
    filteredCommands,
    commandSelectedIndex,
    handleCommandInputChange,
    handleCommandKeyDown,
    insertCommand,
  } = useCommandAutocompleteInput(textareaRef)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0

    const commandHandled = handleCommandInputChange(value, cursorPos)
    if (!commandHandled) {
      handleResourceInputChange(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandAutocomplete) {
      const handled = handleCommandKeyDown(e)
      if (handled) return
    }
    if (showAutocomplete) {
      handleResourceKeyDown(e)
    }
  }

  useEffect(() => {
    if (state.status === 'SUCCESS' && conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [state.status])

  useEffect(() => {
   
    if (state.status === 'SUCCESS' && state.values?.toolResults) {
      const toolResults = state.values.toolResults

      if (typeof toolResults === 'object' && toolResults !== null && !Array.isArray(toolResults)) {
        Object.entries(toolResults).forEach(([toolName, result]) => {
          
          if (
            typeof result === 'object' &&
            result !== null &&
            'content' in result &&
            typeof result.content === 'string'
          ) {
            const typedResult = result as {
              cellType?: CellTypes;
              content: string;
              metadata?: Record<string, any>;
            }

            const resultKey = `${toolName}-${typedResult.content.slice(0, 50)}`

            if (typedResult.cellType && !processedToolResults.current.has(resultKey)) {
              processedToolResults.current.add(resultKey)
              insertCellAfterWithContent(cell.id, typedResult.cellType, typedResult.content)
            }
          }
        })
      }
    }
  }, [state.status, state.values?.toolResults, cell.id, insertCellAfterWithContent])

  const handleSubmit = (formData: FormData) => {
    const question = formData.get('question') as string
    submittedQuestion.current = question
    action(formData)
  }

  const showConversation = state.status === 'SUCCESS' || isPending
  const userQuestion = submittedQuestion.current || cell.content

  return (
    <div className="flex flex-col h-full bg-zinc-50 rounded-lg border border-zinc-200">
      <div
        ref={conversationRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {showConversation && (
          <>
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-zinc-800 text-white rounded-lg px-4 py-3 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{userQuestion}</p>
              </div>
            </div>

            {isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <RagLoadingState />
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
        )}

        {!showConversation && (
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
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none text-sm"
            />

            {showAutocomplete && !showCommandAutocomplete && (
              <ResourceAutocomplete
                resources={filteredResources}
                selectedIndex={selectedIndex}
                onSelect={insertResource}
                loading={loading}
              />
            )}

            {showCommandAutocomplete && (
              <CommandAutocomplete
                commands={filteredCommands}
                selectedIndex={commandSelectedIndex}
                onSelect={insertCommand}
              />
            )}

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
