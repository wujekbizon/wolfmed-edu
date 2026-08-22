'use client'

import { Check } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizOptionRow({
  index,
  text,
  selected,
  onSelect,
}: {
  index: number
  text: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`group/opt w-full text-left flex items-start gap-4 px-4 md:px-5 py-3.5 rounded-xl border transition-colors duration-200 ${
        selected
          ? 'border-slate-700 bg-slate-50'
          : 'border-zinc-200 bg-white hover:border-[#ff9898] hover:bg-fuchsia-50/40'
      }`}
    >
      <span
        className={`shrink-0 w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center mt-0.5 leading-none transition-colors duration-200 ${
          selected
            ? 'bg-slate-700 text-white'
            : 'bg-zinc-100 border border-zinc-200 text-zinc-500 group-hover/opt:bg-gradient-to-br group-hover/opt:from-[#ff9898] group-hover/opt:to-fuchsia-400 group-hover/opt:text-white group-hover/opt:border-transparent'
        }`}
      >
        {selected ? <Check className="w-4 h-4" /> : LETTERS[index]}
      </span>
      <span
        className={`flex-1 text-sm md:text-base leading-relaxed transition-colors ${
          selected ? 'text-zinc-900 font-medium' : 'text-zinc-700'
        }`}
      >
        {text}
      </span>
    </button>
  )
}
