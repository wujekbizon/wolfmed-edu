'use client'

import { ComponentProps } from 'react'

type Props = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
} & Omit<ComponentProps<'input'>, 'type' | 'checked' | 'onChange'>

export default function Checkbox({ label, checked, onChange, className = '', ...props }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          className={`w-5 h-5 border rounded transition-colors
            peer-checked:bg-[#f58a8a] peer-checked:border-[#f58a8a]
            peer-focus:ring-2 peer-focus:ring-[#f58a8a]/20
            ${checked ? 'bg-[#f58a8a] border-[#f58a8a]' : 'bg-zinc-800 border-zinc-700'}
            ${className}
          `}
        >
          {checked && (
            <svg
              className="w-5 h-5 text-black stroke-black"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">{label}</span>
    </label>
  )
}
