'use client'

import { useState } from 'react'
import { Textarea } from '../ui/Textarea'
import Label from '../ui/Label'

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

export default function TestQuestionEditor({
  question,
  onSave,
  onCancel
}: Props) {
  const [text, setText] = useState(question.data.question)
  const [answers, setAnswers] = useState(
    question.data.answers.map((a) => ({ ...a }))
  )
  const [error, setError] = useState<string | null>(null)

  const setOption = (i: number, value: string) =>
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, option: value } : a))
    )

  const toggleCorrect = (i: number) =>
    setAnswers((prev) => prev.map((a, idx) => ({ ...a, isCorrect: idx === i })))

  const handleSave = () => {
    if (!text.trim()) return setError('Treść pytania nie może być pusta.')
    if (answers.some((a) => !a.option.trim())) return setError('Wszystkie odpowiedzi muszą mieć treść.')
    if (!answers.some((a) => a.isCorrect)) return setError('Zaznacz co najmniej jedną poprawną odpowiedź.')
    setError(null)
    onSave({ ...question, data: { question: text.trim(), answers } })
  }

  return (
    <div className='space-y-3 p-4 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 backdrop-blur-sm rounded-lg border border-zinc-200'>
      <div>
        <Label label='Pytanie:' htmlFor='question' />
        <Textarea
          id='question'
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label label='Odpowiedzi:' htmlFor='answers' />
        {answers.map((answer, i) => (
          <div key={i} className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => toggleCorrect(i)}
              title='Oznacz jako poprawną'
              className={`shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
                answer.isCorrect
                  ? 'bg-red-200 border-red-300 animate-pulse'
                  : 'border-zinc-300 hover:border-zinc-400'
              }`}
            />
            <input
              value={answer.option}
              onChange={(e) => setOption(i, e.target.value)}
              className='w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/90 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm'
            />
          </div>
        ))}
      </div>

      {error && <p className='text-xs text-red-500'>{error}</p>}

      <div className='flex gap-2 pt-1'>
        <button
          type='button'
          onClick={handleSave}
          className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-[#f58a8a] hover:bg-[#ff5b5b] px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Dodaj
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-white hover:bg-zinc-100 px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Anuluj
        </button>
      </div>
    </div>
  )
}
