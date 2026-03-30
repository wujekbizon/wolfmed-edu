'use client'

import { useState } from 'react'
import { Sparkles, ArrowUp, X } from 'lucide-react'
import { useRagStore } from '@/store/useRagStore'
import { useRouter, usePathname } from 'next/navigation'
import { useRagCellInput } from '@/hooks/useRagCellInput'
import { AIAutocompleteDropdowns } from './cells/AIAutocompleteDropdowns'

interface SideAIInputProps {
  onDismiss?: () => void
}

const RAG_PAGE = '/panel/nauka'

export default function SideAIInput({ onDismiss }: SideAIInputProps) {
  const [hasText, setHasText] = useState(false)
  const { setPendingTopic } = useRagStore()
  const router = useRouter()
  const pathname = usePathname()
  const isFloating = !!onDismiss

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
    handleChange: ragHandleChange,
    handleKeyDown: ragHandleKeyDown,
  } = useRagCellInput()

  const handleSubmit = () => {
    const trimmed = textareaRef.current?.value.trim()
    if (!trimmed) return
    setPendingTopic(trimmed)
    if (textareaRef.current) textareaRef.current.value = ''
    setHasText(false)
    textareaRef.current?.blur()
    if (pathname !== RAG_PAGE) {
      router.push(RAG_PAGE)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    ragHandleChange(e)
    setHasText(!!e.target.value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    ragHandleKeyDown(e)
    if (e.key === 'Enter' && !e.shiftKey && !e.defaultPrevented) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={isFloating
      ? 'p-3 bg-white/80 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]'
      : 'px-2 py-2'
    }>
      {/* Header */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-zinc-700 font-medium">
          <Sparkles className="w-3 h-3" />
          <span>Asystent AI</span>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
            aria-label="Zamknij"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Input container */}
      <div className="relative">
        <div className="flex flex-col bg-zinc-50 border border-zinc-200 rounded-xl
          focus-within:ring-2 focus-within:ring-zinc-300 focus-within:border-transparent
          transition-all duration-200">
          <textarea
            ref={textareaRef}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Zapytaj asystenta... (@ pliki, / polecenia)"
            rows={isFloating ? 1 : 3}
            className="w-full resize-none text-sm bg-transparent border-none outline-none
              px-3 pt-2.5 pb-1
              text-zinc-800 placeholder:text-zinc-400"
          />
          <div className="flex justify-end px-2 pb-2">
            <button
              onClick={handleSubmit}
              disabled={!hasText}
              className="flex items-center justify-center w-7 h-7 rounded-lg
                bg-zinc-800 text-white
                hover:bg-zinc-700 transition-all duration-200
                disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Wyślij"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

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
          direction="up"
        />
      </div>

      {!isFloating && (
        <p className="text-[10px] text-zinc-400 mt-1.5 px-1">
          Enter ↵ wyślij · Shift+Enter nowa linia
        </p>
      )}
    </div>
  )
}
