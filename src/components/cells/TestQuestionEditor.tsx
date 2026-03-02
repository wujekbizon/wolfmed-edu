'use client'

import { useState } from 'react'

export interface DraftQuestion {
  id: string
  data: {
    question: string
    answers: { option: string; isCorrect: boolean }[]
  }
  meta: { course: string; category: string }
}

interface Props {
  question: DraftQuestion
  onSave: (updated: DraftQuestion) => void
  onCancel: () => void
}

export default function TestQuestionEditor({ question, onSave, onCancel }: Props) {
  const [text, setText] = useState(question.data.question)
  const [answers, setAnswers] = useState(question.data.answers.map(a => ({ ...a })))

  const setOption = (i: number, value: string) =>
    setAnswers(prev => prev.map((a, idx) => idx === i ? { ...a, option: value } : a))

  const toggleCorrect = (i: number) =>
    setAnswers(prev => prev.map((a, idx) => ({ ...a, isCorrect: idx === i })))

  const handleSave = () => {
    if (!text.trim() || answers.some(a => !a.option.trim())) return
    onSave({ ...question, data: { question: text.trim(), answers } })
  }

  return (
    <div className="space-y-3 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div>
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pytanie</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={2}
          className="mt-1 w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Odpowiedzi</label>
        {answers.map((answer, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleCorrect(i)}
              title="Oznacz jako poprawną"
              className={`shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
                answer.isCorrect
                  ? 'bg-green-500 border-green-500'
                  : 'border-zinc-300 hover:border-zinc-400'
              }`}
            />
            <input
              value={answer.option}
              onChange={e => setOption(i, e.target.value)}
              className="flex-1 px-3 py-1.5 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-1.5 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Zapisz
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 border border-zinc-300 text-zinc-600 text-sm rounded-lg hover:bg-zinc-50 transition-colors"
        >
          Anuluj
        </button>
      </div>
    </div>
  )
}
