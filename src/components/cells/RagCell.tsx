"use client"

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function RagCell() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  const topic = searchParams.get('topic')
  const [question, setQuestion] = useState('')

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 flex-wrap">
        {category && (
          <span className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium">
            {category.replace(/-/g, ' ')}
          </span>
        )}
        {topic && (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
            {decodeURIComponent(topic).slice(0, 50)}...
          </span>
        )}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Zadaj pytanie..."
          className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent"
        />
        <button
          className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Wyjaśnij
        </button>
      </div>

      <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
        <p className="text-sm text-zinc-500 italic">RAG response will appear here</p>
      </div>
    </div>
  )
}
