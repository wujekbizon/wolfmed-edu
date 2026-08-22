'use client'

import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { useDropdownSelect } from '@/hooks/useDropdownSelect'
import DropdownSelectOptions from '@/components/ui/DropdownSelectOptions'
import type { SelectOption } from '@/types/uiTypes'

interface DropdownSelect {
  options: SelectOption[]
  value: string | null
  onSelect: (value: string) => void
  placeholder?: string
  ariaLabel: string
  name?: string
  disabled?: boolean
  className?: string
}

export default function DropdownSelect({
  options,
  value,
  onSelect,
  placeholder,
  ariaLabel,
  name,
  disabled,
  className,
}: DropdownSelect) {
  const id = useId()
  const listId = `${id}-listbox`
  const optionId = (index: number) => `${id}-option-${index}`

  const { open, activeIndex, setActiveIndex, containerRef, openAt, close, commit, onKeyDown } =
    useDropdownSelect(options, value, onSelect)

  const selected = options.find((option) => option.value === value)

  return (
    <div ref={containerRef} className={`relative min-w-0 ${className ?? 'w-full'}`}>
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close() : openAt(-1))}
        onKeyDown={onKeyDown}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white
          px-3 py-2 text-left text-sm cursor-pointer transition-colors
          hover:border-zinc-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100
          disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={`truncate ${selected ? 'text-zinc-700' : 'text-zinc-400'}`}>
          {selected?.label ?? placeholder ?? ''}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <DropdownSelectOptions
          options={options}
          value={value}
          activeIndex={activeIndex}
          listId={listId}
          optionId={optionId}
          onPick={commit}
          onHover={setActiveIndex}
        />
      )}
    </div>
  )
}
