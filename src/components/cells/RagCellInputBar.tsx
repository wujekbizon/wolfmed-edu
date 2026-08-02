'use client'

import type { ReactNode } from 'react'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { AIAutocompleteDropdowns } from './AIAutocompleteDropdowns'
import type { useRagCellInput } from '@/hooks/useRagCellInput'
import type { FormState } from '@/types/actionTypes'

interface RagCellInputBarProps {
  cellId: string
  topic: string
  state: FormState
  isPending: boolean
  input: ReturnType<typeof useRagCellInput>
  onSubmit: (formData: FormData) => void
  noScriptFallback: ReactNode
}

export default function RagCellInputBar({
  cellId,
  topic,
  state,
  isPending,
  input,
  onSubmit,
  noScriptFallback,
}: RagCellInputBarProps) {
  return (
    <div className="border-t border-zinc-200 bg-white p-2 sm:p-4">
      <form action={onSubmit} className="space-y-3">
        <input type="hidden" name="cellId" value={cellId} />

        <div className="relative">
          <textarea
            ref={input.textareaRef}
            name="question"
            defaultValue={topic}
            placeholder="Zadaj pytanie... (@ pliki, / polecenia)"
            rows={2}
            onChange={input.handleChange}
            onKeyDown={input.handleKeyDown}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none text-sm"
          />

          <AIAutocompleteDropdowns
            showResourceAutocomplete={input.showResourceAutocomplete}
            showCommandAutocomplete={input.showCommandAutocomplete}
            filteredResources={input.filteredResources}
            filteredCommands={input.filteredCommands}
            resourceSelectedIndex={input.resourceSelectedIndex}
            commandSelectedIndex={input.commandSelectedIndex}
            resourcesLoading={input.resourcesLoading}
            insertResource={input.insertResource}
            insertCommand={input.insertCommand}
          />

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
  )
}
