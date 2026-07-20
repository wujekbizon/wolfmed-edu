'use client'

import { Check } from 'lucide-react'

export default function OpiekunStepRow({
  stepNumber,
  text,
  isMarked,
  onToggle,
}: {
  stepNumber: number
  text: string
  isMarked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isMarked}
      className={`group/step w-full text-left flex items-start gap-4 px-4 md:px-6 py-4 border-l-[3px] transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fuchsia-400/50 ${
        isMarked
          ? 'border-l-slate-700 bg-slate-50'
          : 'border-l-transparent hover:border-l-fuchsia-400 hover:bg-fuchsia-50/40'
      }`}
    >
      <span
        className={`shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center mt-0.5 leading-none transition-colors duration-200 ${
          isMarked
            ? 'bg-slate-700 text-white'
            : 'bg-zinc-100 border border-zinc-200 text-zinc-500 group-hover/step:bg-gradient-to-br group-hover/step:from-[#ff9898] group-hover/step:to-fuchsia-400 group-hover/step:text-white group-hover/step:border-transparent'
        }`}
      >
        {isMarked ? <Check className="w-4 h-4" /> : stepNumber}
      </span>
      <p
        className={`flex-1 text-sm md:text-base leading-relaxed transition-colors duration-200 ${
          isMarked ? 'text-zinc-400' : 'text-zinc-700 group-hover/step:text-zinc-900'
        }`}
      >
        {text}
      </p>
    </button>
  )
}
