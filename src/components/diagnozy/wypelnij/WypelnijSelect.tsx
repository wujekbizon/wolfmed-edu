'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

type Option = { value: string; label: string }

// Custom listbox replacing native <select>: long clinical formulations wrap
// inside the panel instead of blowing out the layout.
export default function WypelnijSelect({
  options,
  value,
  onSelect,
  placeholder,
  ariaLabel,
}: {
  options: Option[]
  value: string | null
  onSelect: (value: string) => void
  placeholder: string
  ariaLabel: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white
          px-3 py-2 text-left text-sm cursor-pointer transition-colors
          hover:border-zinc-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
      >
        <span className={`truncate ${selected ? 'text-zinc-700' : 'text-zinc-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-30 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-lg
            max-h-72 overflow-y-auto scrollbar-webkit p-1"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-zinc-400">Brak pozycji do wyboru.</li>
          )}
          {options.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => {
                  onSelect(option.value)
                  setOpen(false)
                }}
                className={`w-full flex items-start gap-2 text-left text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors
                  ${option.value === value ? 'bg-rose-50 text-zinc-800' : 'text-zinc-700 hover:bg-zinc-50'}`}
              >
                <Check
                  className={`w-4 h-4 mt-0.5 shrink-0 text-rose-500 ${
                    option.value === value ? '' : 'invisible'
                  }`}
                />
                <span className="min-w-0">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
