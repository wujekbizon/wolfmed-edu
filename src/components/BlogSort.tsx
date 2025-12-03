'use client'

import { useState } from 'react'
import { useBlogSearchStore } from '@/store/useBlogSearch'

const SORT_OPTIONS = [
  { value: 'newest' as const, label: 'Od najnowszego' },
  { value: 'oldest' as const, label: 'Od najstarszego' },
  { value: 'popular' as const, label: 'Najpopularniejsze' },
]

export default function BlogSort() {
  const { sortBy, setSortBy } = useBlogSearchStore()
  const [isOpen, setIsOpen] = useState(false)

  const currentOption = SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0]

  return (
    <div className="relative w-full max-w-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative group w-full
          bg-[#2A2A3F]/50 backdrop-blur-md
          border ${isOpen ? 'border-[#BB86FC]/50' : 'border-[#3A3A5A]/50'}
          rounded-2xl
          shadow-lg ${isOpen ? 'shadow-[#BB86FC]/10' : 'shadow-black/20'}
          transition-all duration-300
          hover:shadow-xl hover:shadow-[#BB86FC]/10
          px-5 py-2.5
          flex items-center justify-between
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#BB86FC]/0 via-[#BB86FC]/5 to-[#8686D7]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex items-center gap-3">
          <svg
            className={`w-5 h-5 ${isOpen ? 'text-[#BB86FC]' : 'text-[#A5A5C3]'} transition-colors`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
          <span className="text-[#E6E6F5] text-base font-medium">{currentOption.label}</span>
        </div>

        <svg
          className={`w-4 h-4 text-[#A5A5C3] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-[#2A2A3F] border border-[#3A3A5A]/50 rounded-xl shadow-xl overflow-hidden">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSortBy(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-5 py-3 text-left text-base
                  transition-colors duration-200
                  ${sortBy === option.value
                    ? 'bg-[#BB86FC]/20 text-[#BB86FC]'
                    : 'text-[#E6E6F5] hover:bg-[#3A3A5E]'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
