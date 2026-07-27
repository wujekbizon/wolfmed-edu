'use client'

import { useEffect, useRef } from 'react'
import { Check } from 'lucide-react'
import type { SelectOption } from '@/types/uiTypes'

export default function DropdownSelectOptions({
  options,
  value,
  activeIndex,
  listId,
  optionId,
  onPick,
  onHover,
}: {
  options: SelectOption[]
  value: string | null
  activeIndex: number
  listId: string
  optionId: (index: number) => string
  onPick: (index: number) => void
  onHover: (index: number) => void
}) {
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  return (
    <ul
      id={listId}
      role="listbox"
      className="absolute z-30 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-lg
        max-h-72 overflow-y-auto scrollbar-webkit p-1"
    >
      {options.length === 0 && (
        <li className="px-3 py-2 text-sm text-zinc-400">Brak pozycji do wyboru.</li>
      )}
      {options.map((option, index) => (
        <li
          key={option.value}
          id={optionId(index)}
          ref={index === activeIndex ? activeRef : null}
          role="option"
          aria-selected={option.value === value}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onPick(index)}
          onMouseEnter={() => onHover(index)}
          className={`flex items-start gap-2 text-left text-sm px-3 py-2 rounded-lg cursor-pointer transition-colors
            ${option.value === value ? 'bg-rose-50 text-zinc-800' : 'text-zinc-700'}
            ${index === activeIndex ? 'bg-zinc-100' : ''}`}
        >
          <Check
            className={`w-4 h-4 mt-0.5 shrink-0 text-rose-500 ${
              option.value === value ? '' : 'invisible'
            }`}
          />
          <span className="min-w-0">{option.label}</span>
        </li>
      ))}
    </ul>
  )
}
