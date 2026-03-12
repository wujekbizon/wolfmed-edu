'use client'

import { useState, useRef } from 'react'
import { Sparkles, ArrowUp, X } from 'lucide-react'
import { useRagStore } from '@/store/useRagStore'
import { useRouter, usePathname } from 'next/navigation'

interface SideAIInputProps {
  onDismiss?: () => void
}

const RAG_PAGE = '/panel/nauka'

export default function SideAIInput({ onDismiss }: SideAIInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setPendingTopic } = useRagStore()
  const router = useRouter()
  const pathname = usePathname()
  const isFloating = !!onDismiss

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    setPendingTopic(trimmed)
    setValue('')
    textareaRef.current?.blur()
    if (pathname !== RAG_PAGE) {
      router.push(RAG_PAGE)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className={`flex flex-col gap-2 ${isFloating
      ? 'p-3 bg-white/80 backdrop-blur-md border-t border-zinc-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]'
      : 'p-3'
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between">
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

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Zapytaj asystenta..."
          rows={isFloating ? 1 : 2}
          className={`flex-1 resize-none text-sm bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2
            text-zinc-800 placeholder:text-zinc-400
            focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:border-transparent
            transition-all duration-200
            ${isFloating ? 'max-h-20' : 'max-h-32'}`}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim()}
          className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0
            bg-zinc-800 text-white
            hover:bg-zinc-700 transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Wyślij"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>

      {!isFloating && (
        <p className="text-[10px] text-zinc-400 leading-relaxed">
          Enter ↵ aby wysłać · Shift+Enter nowa linia
        </p>
      )}
    </div>
  )
}
