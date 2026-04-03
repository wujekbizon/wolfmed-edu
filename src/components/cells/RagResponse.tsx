'use client'

import { useState } from 'react'

interface RagResponseProps {
  answer: string
  sources?: string[] | undefined
}

export default function RagResponse({ answer, sources }: RagResponseProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="space-y-3">
      {/* Answer Section */}
      <div className="p-4 bg-white border border-zinc-200 rounded-lg">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-sm font-semibold text-zinc-700">Odpowiedź AI</h3>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
            title="Kopiuj odpowiedź"
          >
            {copied ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Skopiowano
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopiuj
              </>
            )}
          </button>
        </div>

        <div className="prose prose-sm prose-zinc max-w-none">
          <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
            {answer}
          </p>
        </div>
      </div>

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs font-medium text-blue-800 mb-2">Źródła:</p>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((source, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
              >
                {source}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
