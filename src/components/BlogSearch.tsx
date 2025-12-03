'use client'

import { useState } from 'react'

interface BlogSearchProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  title?: string
}

export default function BlogSearch({ searchTerm, setSearchTerm }: BlogSearchProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="w-full">
      <div
        className={`
          relative group
          bg-[#2A2A3F]/50 backdrop-blur-md
          border ${isFocused ? 'border-[#BB86FC]/50' : 'border-[#3A3A5A]/50'}
          rounded-xl
          shadow-lg ${isFocused ? 'shadow-[#BB86FC]/10' : 'shadow-black/20'}
          transition-all duration-300
          hover:shadow-xl hover:shadow-[#BB86FC]/10
        `}
      >
        <div className="absolute inset-0 bg-linear-to-r from-[#BB86FC]/0 via-[#BB86FC]/5 to-[#8686D7]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
          <svg
            className={`w-5 h-5 ${isFocused ? 'text-[#BB86FC]' : 'text-[#A5A5C3]'} transition-colors duration-300`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>

        <input
          type="text"
          name="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Wyszukaj artykuły..."
          className="
            relative z-10
            w-full
            pl-14 pr-14
            py-2.5
            bg-transparent
            text-[#E6E6F5] placeholder-[#A5A5C3]/50
            text-base
            focus:outline-none
            rounded-xl
          "
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full hover:bg-[#3A3A5E] transition-colors duration-200"
            aria-label="Wyczyść"
          >
            <svg
              className="w-4 h-4 text-[#A5A5C3] hover:text-[#E6E6F5]"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
