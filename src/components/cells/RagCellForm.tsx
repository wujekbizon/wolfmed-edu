'use client'

import { useActionState, useRef, useEffect, useState } from 'react'
import { askRagQuestion } from '@/actions/rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useResourceAutocomplete } from '@/hooks/useResourceAutocomplete'
import RagResponse from './RagResponse'
import RagLoadingState from './RagLoadingState'
import { ResourceAutocomplete } from './ResourceAutocomplete'

export default function RagCellForm({ cell }: { cell: { id: string; content: string } }) {
  const [state, action, isPending] = useActionState(askRagQuestion, EMPTY_FORM_STATE)
  const noScriptFallback = state.status === 'ERROR' ? useToastMessage(state) : null
  const formRef = useRef<HTMLFormElement>(null)
  const conversationRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submittedQuestion = useRef<string>('')

  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [autocompleteQuery, setAutocompleteQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { resources, loading } = useResourceAutocomplete()

  useEffect(() => {
    if (state.status === 'SUCCESS' && conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [state.status])

  const handleSubmit = (formData: FormData) => {
    const question = formData.get('question') as string
    submittedQuestion.current = question
    action(formData)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0

    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1)
      if (!query.includes(' ')) {
        setAutocompleteQuery(query)
        setShowAutocomplete(true)
        setSelectedIndex(0)
        return
      }
    }

    setShowAutocomplete(false)
  }

  const filteredResources = resources.filter((r) =>
    r.name.toLowerCase().includes(autocompleteQuery.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filteredResources.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filteredResources.length > 0) {
      e.preventDefault()
      const selected = filteredResources[selectedIndex]
      if (selected) {
        insertResource(selected.name)
      }
    } else if (e.key === 'Escape') {
      setShowAutocomplete(false)
    }
  }

  const insertResource = (filename: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
    const value = textarea.value

    const textBefore = value.substring(0, cursorPos)
    const atIndex = textBefore.lastIndexOf('@')

    const newValue =
      value.substring(0, atIndex) + `@${filename} ` + value.substring(cursorPos)

    textarea.value = newValue
    const newCursorPos = atIndex + filename.length + 2
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
    setShowAutocomplete(false)
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
              placeholder="Zadaj pytanie dotyczące materiałów medycznych... (użyj @ aby odwołać się do plików)"
              rows={2}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none text-sm"
            />

            {showAutocomplete && (
              <ResourceAutocomplete
                resources={filteredResources}
                selectedIndex={selectedIndex}
                onSelect={insertResource}
                loading={loading}
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
