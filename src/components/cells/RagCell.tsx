"use client"

import { useState } from 'react'

export default function RagCell({ cell }: { cell: { id: string; content: string } }) {
  const [question, setQuestion] = useState(cell.content)

  return (
    <div className="p-4 space-y-4">
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
