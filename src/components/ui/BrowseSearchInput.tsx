'use client'

import { Search, X } from 'lucide-react'
import Input from '@/components/ui/Input'

export default function BrowseSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
}) {
  return (
    <div className={`relative ${className ?? 'w-full'}`}>
      <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400' />
      <Input
        type='text'
        value={value}
        onChangeHandler={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        className='w-full h-10 rounded-xl border border-zinc-300 bg-white pl-9 pr-9 text-sm text-zinc-700 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100'
      />
      {value && (
        <button
          type='button'
          onClick={() => onChange('')}
          aria-label='Wyczyść wyszukiwanie'
          className='absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 cursor-pointer'
        >
          <X className='w-4 h-4' />
        </button>
      )}
    </div>
  )
}
